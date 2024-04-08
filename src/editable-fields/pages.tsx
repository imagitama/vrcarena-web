import React from 'react'
import { PagesFieldNames, PlaylistsFieldNames } from '../data-store'
import { fieldTypes } from '../generic-forms'
import MarkdownEditor from '../components/markdown-editor'
import { EditableField } from './'

const fields: EditableField<any>[] = [
  {
    name: PagesFieldNames.title,
    label: 'Title',
    type: fieldTypes.text,
    isRequired: true,
  },
  {
    name: PlaylistsFieldNames.description,
    label: 'Description',
    type: fieldTypes.text,
    default: '',
  },
  {
    name: PagesFieldNames.content,
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
