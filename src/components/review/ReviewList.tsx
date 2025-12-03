import React from 'react';
import type { Review } from '../../types/product';

interface ReviewListProps {
  reviews: Review[];
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Ще немає відгуків. Будьте першим!</p>
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Відгуки покупців</h3>
        <div className="text-sm text-gray-600">
          Середня оцінка: {averageRating.toFixed(1)} ★ ({reviews.length} відгуків)
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-semibold text-gray-900">{review.userName}</span>
                <div className="flex items-center mt-1">
                  <div className="text-yellow-400">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('uk-UA')}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mt-2">{review.comment}</p>
            
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <button className="flex items-center space-x-1 hover:text-gray-700">
                <span>👍</span>
                <span>{review.likes}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-gray-700">
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