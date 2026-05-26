import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { reviewApi } from '../../services/review.api';
import { useAuthStore } from '../../stores/auth-store';
import { useToast } from '../../contexts/ToastContext';

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast('Увійдіть, щоб залишити відгук', 'error');
      return;
    }
    
    if (rating === 0) {
      showToast('Будь ласка, оберіть рейтинг', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewApi.create(productId, { rating, comment });
      showToast('Відгук додано!', 'success');
      setRating(0);
      setComment('');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Помилка додавання відгуку', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-accent text-center">
        <p className="text-text/60">Увійдіть, щоб залишити відгук</p>
        <Link to="/login">
          <Button variant="outline" className="mt-3">Увійти</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-accent">
      <h3 className="text-lg font-semibold mb-4">Залишити відгук</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Ваша оцінка
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl focus:outline-none transition hover:scale-110"
              >
                {star <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Ваш коментар
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-button"
            placeholder="Поділіться враженнями про товар..."
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full"
        >
          {isSubmitting ? 'Відправка...' : 'Надіслати відгук'}
        </Button>
      </form>
    </div>
  );
};