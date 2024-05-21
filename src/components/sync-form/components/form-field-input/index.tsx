import React from 'react'
import {
  SyncFieldBase,
  SyncFieldResult,
  SyncFieldTypes,
} from '../../../../syncing'
import TextInput from '../../../text-input'
import AttachmentsSelector from '../attachment-selector'
import MarkdownInput from '../markdown-input'
import ThumbnailSelector from '../thumbnail-selector'

const FormFieldInput = ({
  fieldMeta,
  value,
  fieldResult,
  onChange,
  isDisabled,
}: {
  fieldMeta: SyncFieldBase<any>
  fieldResult: SyncFieldResult
  value: any
  onChange: (newVal: any) => void
  isDisabled: boolean
}) => {
  switch (fieldMeta.type) {
    case SyncFieldTypes.Text:
      return (
        <TextInput
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
          isDisabled={isDisabled}
        />
      )
    case SyncFieldTypes.ImageUrl:
      return (
        <ThumbnailSelector
          overrideUrl={fieldResult.value}
          finalUrl={value}
          imageUrls={[]}
          onDone={(finalUrl) => onChange(finalUrl)}
        />
      )
    // shows cropper for image
    case SyncFieldTypes.ThumbnailFromUrls:
      return (
        <ThumbnailSelector
          finalUrl={value}
          imageUrls={fieldResult.value}
          onDone={(finalUrl) => onChange(finalUrl)}
        />
      )
    case SyncFieldTypes.Markdown:
      return (
        <MarkdownInput
          value={value}
          onChange={(newText) => onChange(newText)}
          isDisabled={isDisabled}
        />
      )
    case SyncFieldTypes.Attachments:
      return (
        <AttachmentsSelector
          attachments={fieldResult.value}
          onDone={(attachmentIds) => onChange(attachmentIds)}
          isDisabled={isDisabled}
        />
      )
    default:
      return <>Unknown type "{fieldMeta.type}"</>
  }
}

export default FormFieldInput
