import React from 'react'
import MarkdownEditor from '../../../markdown-editor'

export default ({ onChange, value }) => (
  <>
    <MarkdownEditor content={value} onChange={newText => onChange(newText)} />
  </>
)
