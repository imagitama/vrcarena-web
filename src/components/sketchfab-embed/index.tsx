import React from 'react'

export default ({ url, className = '' }: { url: string, className?: string }) => (
  <iframe
    allow="autoplay; fullscreen; vr"
    src={url}
    className={className}
    title="Sketchfab embed"
  />
)
