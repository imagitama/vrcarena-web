import React from 'react'
import FormHelperText from '@mui/material/FormHelperText'
import ImageUploader from '../../../image-uploader'
import { fixAccessingImagesUsingToken } from '../../../../utils'
import Button from '../../../button'
import { ImageUploadEditableField } from '../../../../editable-fields'

export default ({
  editableField,
  onChange,
  value,
  formFields,
}: {
  editableField: ImageUploadEditableField<any>
  onChange: (newUrl: string | null) => void
  value: string
  formFields: any
}) => {
  return (
    <>
      {value ? (
        <div>
          <img
            src={fixAccessingImagesUsingToken(value)}
            alt="Preview"
            width={editableField.requiredWidth}
            height={editableField.requiredHeight}
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
            {...editableField}
            directoryPath={
              editableField.getDirectoryPath
                ? editableField.getDirectoryPath(formFields)
                : editableField.directoryPath
            }
          />
          <FormHelperText>
            {editableField.requiredWidth} x {editableField.requiredHeight}
          </FormHelperText>
        </>
      )}
    </>
  )
}
