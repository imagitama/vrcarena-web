import React from 'react'
import TextInput from '@/components/text-input'
import { EditableField } from '@/editable-fields'

export default ({
  editableField,
  onChange,
  value,
}: {
  editableField: EditableField<any, any>
  value: string
  onChange: (newStr: string) => void
}) => (
  <TextInput
    onChange={(e) => onChange(e.target.value)}
    value={value}
    multiline={editableField.multiline === true}
    minRows={editableField.multiline ? 3 : 0}
    fullWidth
  />
)
