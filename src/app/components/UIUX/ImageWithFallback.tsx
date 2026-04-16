import React, { useState } from 'react'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt, className, style, ...rest } = props
  const [error, setError] = useState(false)

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400';
    if (url.startsWith('http')) return url;
    
    // Resolve relative backend paths
    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
    const cleanBase = API_BASE.replace('/api', '');
    return `${cleanBase}/${url.startsWith('/') ? url.slice(1) : url}`;
  };

  const finalSrc = error 
    ? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400' 
    : getImageUrl(src);

  return (
    <img 
      src={finalSrc} 
      alt={alt} 
      className={className} 
      style={style} 
      onError={() => {
        if (!error) setError(true)
      }}
      {...rest} 
    />
  )
}
