import React from 'react'
import MarkdownEditor from '../../../markdown-editor'

export default ({ onChange, value }: {
  value: string
  onChange: (newVal: string) => void
}) => (
  <MarkdownEditor content={value} onChange={newText => onChange(newText)} />
)
