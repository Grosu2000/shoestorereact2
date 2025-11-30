import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleKeyPress,
  };
};