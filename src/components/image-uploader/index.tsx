import React from 'react'
import type { ImageUploaderProps } from './lazy'

export type { ImageUploaderProps }

const LazyImageUploader = React.lazy(() => import('./lazy'))

const ImageUploader = (props: ImageUploaderProps) => (
  <LazyImageUploader {...props} />
)

export default ImageUploader
