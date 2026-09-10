import React from 'react'

import { TagEditableField } from '@/editable-fields'
import TagsInput, { TagsInputSettings } from '@/components/tags-input'

export default ({
  editableField,
  onChange,
  value,
}: {
  editableField: TagEditableField<any>
  value: string[]
  onChange: (newTags: string[]) => void
} & TagsInputSettings) => (
  <TagsInput
    onChange={(newTags) => onChange(newTags)}
    currentTags={value}
    {...editableField}
  />
)
