import React from 'react'

export default ({ url, className = '' }) => (
  <iframe
    frameBorder="0"
    allow="autoplay; fullscreen; vr"
    src={url}
    className={className}
    title="Sketchfab embed"
  />
)
