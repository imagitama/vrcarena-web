import React from 'react'

import { fieldTypes } from '@/generic-forms'
import { Page } from '@/modules/pages'

import type { EditableField } from './'

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
    type: fieldTypes.textMarkdown,
  },
]

export default fields
