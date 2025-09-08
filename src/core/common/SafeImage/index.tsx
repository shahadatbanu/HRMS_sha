import React, { memo, useRef, useCallback, useMemo } from 'react';
import { img_path } from '../../../environment';

interface SafeImageProps {
  className?: string;
  src: string;
  alt?: string;
  height?: number;
  width?: number;
  id?: string;
  style?: React.CSSProperties;
  onError?: () => void;
  onLoad?: () => void;
  fallbackSrc?: string;
}

const SafeImage = memo<SafeImageProps>((props) => {
  const { 
    src, 
    fallbackSrc = 'assets/img/users/user-01.jpg', 
    onError,
    ...otherProps 
  } = props;
  
  const errorCountRef = useRef(0);
  const maxRetries = 1; // Only allow one fallback attempt
  
  // Memoize the full source path to prevent unnecessary re-renders
  const fullSrc = useMemo(() => {
    if (src.startsWith('/') || src.startsWith('http')) {
      return src;
    }
    return `${img_path}${src}`;
  }, [src]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    
    // Prevent infinite loops by tracking error count
    if (errorCountRef.current >= maxRetries) {
      console.warn('🖼️ Image failed to load after maximum retries:', target.src);
      target.style.display = 'none'; // Hide the broken image
      onError?.();
      return;
    }
    
    errorCountRef.current += 1;
    
    // Only try fallback if we haven't exceeded max retries
    if (errorCountRef.current === 1 && fallbackSrc) {
      console.log('🖼️ Image failed, trying fallback:', fallbackSrc);
      target.src = fallbackSrc.startsWith('/') || fallbackSrc.startsWith('http') 
        ? fallbackSrc 
        : `${img_path}${fallbackSrc}`;
    } else {
      // If fallback also fails, hide the image
      target.style.display = 'none';
      onError?.();
    }
  }, [fallbackSrc, onError]);

  return (
    <img
      {...otherProps}
      src={fullSrc}
      onError={handleError}
    />
  );
});

SafeImage.displayName = 'SafeImage';

export default SafeImage;
