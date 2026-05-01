import React from 'react'

import { TagEditableField } from '@/editable-fields'
import TagInput, { TagInputSettings } from '@/components/tag-input'

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
