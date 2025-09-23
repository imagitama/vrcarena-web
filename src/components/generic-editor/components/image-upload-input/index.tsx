import React from 'react'
import FormHelperText from '@mui/material/FormHelperText'
import ImageUploader from '../../../image-uploader'
import { fixAccessingImagesUsingToken } from '../../../../utils'
import Button from '../../../button'
import { ImageUploadEditableField } from '../../../../editable-fields'

export default ({
  onChange,
  value,
  formFields,
  ...props
}: {
  onChange: (newUrl: string | null) => void
  value: string
  formFields: any
} & ImageUploadEditableField<any>) => {
  return (
    <>
      {value ? (
        <div>
          <img
            src={fixAccessingImagesUsingToken(value)}
            alt="Preview"
            width={props.requiredWidth}
            height={props.requiredHeight}
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
            {...props}
            directoryPath={
              props.getDirectoryPath
                ? props.getDirectoryPath(formFields)
                : props.directoryPath
            }
          />
          <FormHelperText>
            {props.requiredWidth} x {props.requiredHeight}
          </FormHelperText>
        </>
      )}
    </>
  )
}
