/**
 * Hook for handling image loading with fallback
 */
import { useState, useEffect } from 'react';
import { generateLocalAvatarUrl, generatePlaceholderUrl } from '@/utils/avatarUtils';

export const useImageFallback = (src, fallbackText = 'U', fallbackBgColor = '2563EB', fallbackTextColor = 'FFFFFF') => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      // No source provided, use fallback immediately
      const fallbackSrc = generateLocalAvatarUrl(fallbackText, `#${fallbackBgColor}`, `#${fallbackTextColor}`);
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Test if the image can be loaded
    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
    };

    img.onerror = () => {
      console.warn(`Failed to load image: ${src}, using fallback`);

      // Try alternative placeholder service first
      const alternativeSrc = generatePlaceholderUrl(fallbackText, fallbackBgColor, fallbackTextColor);

      // Test alternative source
      const altImg = new Image();
      altImg.onload = () => {
        setImageSrc(alternativeSrc);
        setIsLoading(false);
        setHasError(false);
      };

      altImg.onerror = () => {
        // Use local fallback as last resort
        const localFallback = generateLocalAvatarUrl(fallbackText, `#${fallbackBgColor}`, `#${fallbackTextColor}`);
        setImageSrc(localFallback);
        setIsLoading(false);
        setHasError(true);
      };

      altImg.src = alternativeSrc;
    };

    img.src = src;
  }, [src, fallbackText, fallbackBgColor, fallbackTextColor]);

  return {
    src: imageSrc,
    isLoading,
    hasError,
    retry: () => {
      if (src) {
        setIsLoading(true);
        setHasError(false);
        const img = new Image();
        img.onload = () => {
          setImageSrc(src);
          setIsLoading(false);
          setHasError(false);
        };
        img.onerror = () => {
          const fallbackSrc = generateLocalAvatarUrl(fallbackText, `#${fallbackBgColor}`, `#${fallbackTextColor}`);
          setImageSrc(fallbackSrc);
          setIsLoading(false);
          setHasError(true);
        };
        img.src = src;
      }
    }
  };
};

export default useImageFallback;
