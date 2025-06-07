import React from 'react'
import { fieldTypes } from '../generic-forms'
import MarkdownEditor from '../components/markdown-editor'
import { EditableField } from './'
import { Page } from '../modules/pages'

const fields: EditableField<Page, string>[] = [
  {
    name: 'title',
    label: 'Title',
    type: fieldTypes.text,
    isRequired: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: fieldTypes.text,
    default: '',
  },
  {
    name: 'content',
    label: 'Content',
    type: fieldTypes.custom,
    customProperties: {
      renderer: ({ onChange, value }) => (
        <MarkdownEditor content={value} onChange={onChange} />
      ),
    },
  },
]

export default fields
