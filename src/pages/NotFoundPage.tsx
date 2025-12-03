import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Сторінку не знайдено</h2>
        <p className="text-gray-600 mt-2 mb-8">
          Сторінка, яку ви шукаєте, не існує або була переміщена.
        </p>
        <Link to="/">
          <Button size="lg">
            Повернутися на головну
          </Button>
        </Link>
      </div>
    </div>
  );
};