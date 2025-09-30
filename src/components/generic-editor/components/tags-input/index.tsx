import React from 'react'
import TagInput, { TagInputSettings } from '../../../tag-input'
import { TagEditableField } from '@/editable-fields'

export default ({
  editableField,
  onChange,
  value,
}: {
  editableField: TagEditableField<any, any>
  value: string[]
  onChange: (newTags: string[]) => void
} & TagInputSettings) => (
  <TagInput
    onChange={(newTags) => onChange(newTags)}
    currentTags={value}
    {...editableField}
  />
)
