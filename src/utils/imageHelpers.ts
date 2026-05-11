const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '/images/placeholder.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`;
  return imagePath;
};

export const getFirstImage = (images: string[] | undefined): string => {
  if (!images || images.length === 0) return '/images/placeholder.jpg';
  return getImageUrl(images[0]);
};