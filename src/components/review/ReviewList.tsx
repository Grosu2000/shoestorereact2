import React, { useEffect, useState } from 'react';
import type { Review } from '../../services/review.api';  // ← type-only import
import { reviewApi } from '../../services/review.api';
import { useAuthStore } from '../../stores/auth-store';

interface ReviewListProps {
  productId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  // const { user } = useAuthStore();  ← ВИДАЛИТИ АБО ЗАКОМЕНТУВАТИ (якщо не використовується)

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await reviewApi.getByProduct(productId);
      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reviewId: string, type: 'like' | 'dislike') => {
    try {
      const response = await reviewApi.like(reviewId, type);
      setReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, likes: response.data.likes, dislikes: response.data.dislikes }
          : review
      ));
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Завантаження відгуків...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text/60">Ще немає відгуків. Будьте першим!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Відгуки покупців</h3>
        <div className="text-sm text-text/60">
          Середня оцінка: {averageRating.toFixed(1)} ★ ({reviews.length} відгуків)
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border border-accent">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-semibold text-text">{review.userName}</span>
                <div className="flex items-center mt-1">
                  <div className="text-amber-500">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                  <span className="ml-2 text-sm text-text/50">
                    {new Date(review.createdAt).toLocaleDateString('uk-UA')}
                  </span>
                </div>
              </div>
              {review.isVerifiedPurchase && (
                <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                  Підтверджена покупка
                </span>
              )}
            </div>
            
            <p className="text-text/80 mt-2">{review.comment}</p>
            
            <div className="flex items-center space-x-4 mt-3 text-sm text-text/60">
              <button
                onClick={() => handleLike(review.id, 'like')}
                className="flex items-center space-x-1 hover:text-success transition"
              >
                <span>👍</span>
                <span>{review.likes}</span>
              </button>
              <button
                onClick={() => handleLike(review.id, 'dislike')}
                className="flex items-center space-x-1 hover:text-error transition"
              >
                <span>👎</span>
                <span>{review.dislikes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};