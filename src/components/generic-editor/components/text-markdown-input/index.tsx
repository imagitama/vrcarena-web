import React from 'react'
import MarkdownEditor from '../../../markdown-editor'
import { MarkdownEditableField } from '@/editable-fields'

export default ({
  editableField,
  onChange,
  value,
}: {
  editableField: MarkdownEditableField<any, any>
  value: string
  onChange: (newVal: string) => void
}) => (
  <MarkdownEditor
    content={value}
    onChange={(newText) => onChange(newText)}
    allowImages={editableField.allowImages}
  />
)
