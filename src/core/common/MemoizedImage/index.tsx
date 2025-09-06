import React, { memo, useMemo } from 'react';
import { img_path } from '../../../environment';

interface MemoizedImageProps {
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

const MemoizedImage = memo<MemoizedImageProps>((props) => {
  const { src, fallbackSrc = 'assets/img/users/user-01.jpg', ...otherProps } = props;
  
  // Memoize the full source path to prevent unnecessary re-renders
  const fullSrc = useMemo(() => {
    if (src.startsWith('/') || src.startsWith('http')) {
      return src;
    }
    return `${img_path}${src}`;
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src !== fallbackSrc && fallbackSrc) {
      target.src = fallbackSrc;
    }
    props.onError?.();
  };

  return (
    <img
      {...otherProps}
      src={fullSrc}
      onError={handleError}
    />
  );
});

MemoizedImage.displayName = 'MemoizedImage';

export default MemoizedImage;
