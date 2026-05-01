import React from 'react'

import { MarkdownEditableField } from '@/editable-fields'
import MarkdownEditor from '@/components/markdown-editor'

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
