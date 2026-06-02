import React, { useEffect, useState } from 'react';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
}

interface ReviewListProps {
  productId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}/reviews?page=1&_=${Date.now()}`);
        const data = await response.json();
        console.log('Fetched reviews:', data);
        if (data && data.data && data.data.reviews) {
          setReviews(data.data.reviews);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  if (loading) {
    return <div className="text-center py-4">Завантаження відгуків...</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-center py-4 text-gray-500">Ще немає відгуків</div>;
  }

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xl font-bold">Відгуки ({reviews.length})</h3>
      {reviews.map((review) => (
        <div key={review.id} className="border p-4 rounded-lg bg-white">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold">{review.userName}</span>
              <div className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
            </div>
            <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="mt-2">{review.comment}</p>
          {review.reply && (
            <div className="mt-2 pl-4 border-l-2 border-blue-500 text-sm text-gray-600">
              <span className="font-medium">Відповідь адміна:</span> {review.reply}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};