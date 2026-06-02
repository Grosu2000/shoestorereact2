import React, { useEffect, useState } from 'react';
import type { Review } from '../../services/review.api';
import { reviewApi } from '../../services/review.api';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
interface ReviewListProps {
  productId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchReviews();
  }, [productId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewApi.getByProduct(productId, page);
      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reviewId: string, type: 'like' | 'dislike') => {
    if (!user) return;
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

  if (loading && page === 1) {
    return <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border border-accent">
        <p className="text-text/60">Ще немає відгуків. Будьте першим!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-semibold">Відгуки покупців</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-amber-500">
              {'★'.repeat(Math.floor(averageRating))}
              {'☆'.repeat(5 - Math.floor(averageRating))}
            </div>
            <span className="text-text/60">{averageRating.toFixed(1)} • {totalReviews} відгуків</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-5 rounded-xl shadow-soft border border-accent">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-text">{review.userName}</span>
                  <div className="flex text-amber-500">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">Підтверджена покупка</span>
                  )}
                </div>
                <p className="text-text/60 text-sm mt-1">{new Date(review.createdAt).toLocaleDateString('uk-UA')}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleLike(review.id, 'like')} className="flex items-center gap-1 text-text/50 hover:text-success transition">
                  👍 {review.likes}
                </button>
                <button onClick={() => handleLike(review.id, 'dislike')} className="flex items-center gap-1 text-text/50 hover:text-error transition">
                  👎 {review.dislikes}
                </button>
              </div>
            </div>
            
            <p className="text-text/80 mt-3 leading-relaxed">{review.comment}</p>
            
            {review.reply && (
              <div className="mt-3 pl-4 border-l-2 border-button">
                <p className="text-sm font-medium text-button">Адміністратор:</p>
                <p className="text-text/70 text-sm mt-1">{review.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            ← Попередні
          </Button>
          <span className="px-4 py-2 text-text">Сторінка {page} з {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Наступні →
          </Button>
        </div>
      )}
    </div>
  );
};