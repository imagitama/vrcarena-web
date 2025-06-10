import React from 'react'
import FormHelperText from '@mui/material/FormHelperText'
import ImageUploader from '../../../image-uploader'
import { fixAccessingImagesUsingToken } from '../../../../utils'
import Button from '../../../button'
import { ImageUploadProperties } from '../../../../editable-fields'

export default ({
  onChange,
  value,
  imageUploadProperties: { bucketName, width, height, directoryName },
}: {
  onChange: (newUrl: string | null) => void
  value: string
  imageUploadProperties: ImageUploadProperties
}) => {
  return (
    <>
      {value ? (
        <div>
          <img
            src={fixAccessingImagesUsingToken(value)}
            alt="Preview"
            width={width}
            height={height}
          />
          <br />
          <Button color="secondary" onClick={() => onChange(null)}>
            Clear
          </Button>
        </div>
      ) : (
        <>
          <ImageUploader
            onDone={(urls) => onChange(urls[0])}
            bucketName={bucketName}
            requiredWidth={width}
            requiredHeight={height}
            directoryPath={directoryName}
          />
          <FormHelperText>
            {width} x {height}
          </FormHelperText>
        </>
      )}
    </>
  )
}
