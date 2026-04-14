import React, { useState } from 'react'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

  if (didError) {
    return (
      <div
        className={`inline-block ${className ?? ''}`}
        style={{
          ...style,
          background: 'linear-gradient(135deg, #6B8E23 0%, #8FBC5A 50%, #5B6F1E 100%)',
        }}
      >
        <div className="flex items-center justify-center w-full h-full text-white/60 text-sm">
          {alt || 'Image'}
        </div>
      </div>
    )
  }

  return (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
