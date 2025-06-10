import React from 'react'
import ImageUploader, { ImageUploaderProps } from '../image-uploader'
import Button from '../button'

const ImageUploaderWithPreview = ({
  value,
  onClear,
  ...imageUploaderProps
}: ImageUploaderProps & { value: string; onClear: () => void }) => {
  return (
    <>
      {value ? (
        <>
          <img src={value} />
          <Button onClick={() => onClear()} color="secondary">
            Try Again
          </Button>
        </>
      ) : (
        <ImageUploader {...imageUploaderProps} />
      )}
    </>
  )
}

export default ImageUploaderWithPreview
