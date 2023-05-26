import React from 'react'
import { PagesFieldNames, PlaylistsFieldNames } from '../data-store'
import { fieldTypes } from '../generic-forms'
import MarkdownEditor from '../components/markdown-editor'

export default [
  {
    name: PagesFieldNames.title,
    label: 'Title',
    type: fieldTypes.text,
    isRequired: true
  },
  {
    name: PlaylistsFieldNames.description,
    label: 'Description',
    type: fieldTypes.textMarkdown,
    default: ''
  },
  {
    name: PagesFieldNames.content,
    label: 'Content',
    type: fieldTypes.custom,
    fieldProperties: {
      renderer: ({ onChange, value }) => (
        <MarkdownEditor content={value} onChange={onChange} />
      )
    }
  }
]
