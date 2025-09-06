import React, { memo, useMemo } from 'react';
import { backend_url } from '../../../environment';
import MemoizedImage from '../MemoizedImage';

interface ProfileImageProps {
  profileImage?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  width?: number;
  height?: number;
}

const ProfileImage = memo<ProfileImageProps>((props) => {
  const { 
    profileImage, 
    alt = 'Profile', 
    fallbackSrc = 'assets/img/users/user-01.jpg',
    ...otherProps 
  } = props;

  // Memoize the profile image URL to prevent unnecessary re-renders
  const imageSrc = useMemo(() => {
    if (!profileImage) {
      return fallbackSrc;
    }
    
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    
    return `${backend_url}/uploads/${profileImage}`;
  }, [profileImage, fallbackSrc]);

  return (
    <MemoizedImage
      {...otherProps}
      src={imageSrc}
      alt={alt}
      fallbackSrc={fallbackSrc}
    />
  );
});

ProfileImage.displayName = 'ProfileImage';

export default ProfileImage;
