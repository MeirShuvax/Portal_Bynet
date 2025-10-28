import React from 'react';
import { Image } from 'react-bootstrap';
import { getImageUrl } from '../constants';
import bynetLogo from '../assets/bynet-logo.png';

const ImageComponent = ({ 
  src, 
  alt, 
  fallbackSrc = bynetLogo, 
  className = '', 
  style = {},
  onError = null,
  onLoad = null,
  ...props 
}) => {
  const imageUrl = getImageUrl(src);
  
  const handleError = (e) => {
    console.error('❌ Image failed to load:', imageUrl);
    console.error('❌ Original src:', src);
    console.error('❌ Alt text:', alt);
    console.error('❌ ImageComponent props:', { src, alt, fallbackSrc });
    if (onError) {
      onError(e);
    }
    // Fallback to default image
    if (e.target && fallbackSrc) {
      e.target.src = fallbackSrc;
    }
  };

  const handleLoad = (e) => {
    console.log('✅ Image loaded successfully:', imageUrl);
    if (onLoad) {
      onLoad(e);
    }
  };

  return (
    <Image
      src={imageUrl || fallbackSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default ImageComponent;
