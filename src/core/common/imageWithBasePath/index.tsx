import React from 'react';
import { img_path } from '../../../environment';

interface Image {
  className?: string;
  src: string;
  alt?: string;
  height?: number;
  width?: number;
  id?: string;
  style?: React.CSSProperties;
  onError?: () => void;
}

const ImageWithBasePath = (props: Image) => {
  // If src starts with '/' or 'http', use as is. Otherwise, prepend img_path.
  const fullSrc = props.src.startsWith('/') || props.src.startsWith('http')
    ? props.src
    : `${img_path}${props.src}`;
  return (
    <img
      className={props.className}
      src={fullSrc}
      height={props.height}
      alt={props.alt}
      width={props.width}
      id={props.id}
      style={props.style}
      onError={props.onError}
    />
  );
};

export default ImageWithBasePath;
