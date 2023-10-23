import { EditableField } from '../editable-fields'
import { fieldTypes } from '../generic-forms'
import { categories } from '../utils/tags'

export interface Tag {
  id: string
  label: string
  category: string
  description: string
  isadult: boolean
  createdby: string
  createdat: Date
  lastmodifiedby: string
  lastmodifiedat: Date
}

export interface TagMeta {
  id: string
  editornotes: string
  accessstatus: 'public' | 'deleted'
  lastmodifiedby: string
  lastmodifiedat: Date
  createdby: string
  createdat: Date
}

export interface TagStats {
  tag: string
  count: number
}

export interface FullTag extends Tag, TagMeta, TagStats {}

export const CollectionNames = {
  Tags: 'tags',
  TagsMeta: 'tagsmeta'
}

export const editableFields: EditableField[] = [
  {
    name: 'label',
    label: 'Label',
    type: fieldTypes.text,
    hint:
      'User-friendly version of the tag - will be generated from the tag if nothing is set'
  },
  {
    name: 'category',
    label: 'Category',
    type: fieldTypes.text,
    hint: `A way to group tags in the asset editor. Categories: ${Object.values(
      categories
    ).join(', ')}`
  },
  {
    name: 'description',
    label: 'Description',
    type: fieldTypes.text,
    hint: 'A sentence that describes the tag'
  },
  {
    name: 'isadult',
    label: 'Is adult',
    type: fieldTypes.checkbox,
    hint:
      'Hide this tag if you do not have adult content enabled (NOT CURRENTLY IN USE)'
  }
]
