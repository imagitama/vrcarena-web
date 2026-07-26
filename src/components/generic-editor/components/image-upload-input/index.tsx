import React from 'react'
import FormHelperText from '@mui/material/FormHelperText'
import styled from '@emotion/styled'

import { fixAccessingImagesUsingToken } from '@/utils'
import { ImageUploadEditableField } from '@/editable-fields'

import ImageUploader from '@/components/image-uploader'
import { ClearButton } from '@/components/button'
import { GenericInputProps } from '../../types'

const ImagePreview = styled.div`
  display: flex;
  align-items: center;
`

export default <TRecord extends Record<string, any>>({
  editableField,
  onChange,
  value,
  formFields,
}: GenericInputProps<
  string | null,
  TRecord,
  ImageUploadEditableField<TRecord>
>) => {
  return (
    <>
      {value ? (
        <ImagePreview>
          <img
            src={fixAccessingImagesUsingToken(value)}
            alt="Preview"
            width={editableField.requiredWidth}
            height={editableField.requiredHeight}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          <ClearButton onClick={() => onChange(null)} />
        </ImagePreview>
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
