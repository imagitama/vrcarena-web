import React from 'react'
import type { ImageUploaderProps } from './lazy'

const LazyImageUploader = React.lazy(() => import('./lazy'))

const ImageUploader = (props: ImageUploaderProps) => (
  <LazyImageUploader {...props} />
)

export default ImageUploader
