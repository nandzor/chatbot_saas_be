import { useState, useCallback } from 'react';

/**
 * Generic Modal Hook
 * Provides consistent modal state management
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const open = useCallback((modalData = null) => {
    setIsOpen(true);
    setData(modalData);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle
  };
};
