import { EditableField } from '../editable-fields'
import { fieldTypes } from '../generic-forms'
import { categories } from '../utils/tags'
import * as icons from '../icons'
import { AccessStatus } from './common'

export interface Tag {
  id: string // tag itself
  label: string
  category: string
  description: string
  isadult: boolean
  oppositetag: string
  icon: string // svg
  createdby: string
  createdat: Date
  lastmodifiedby: string
  lastmodifiedat: Date
}

export interface TagMeta {
  id: string
  editornotes: string
  accessstatus: AccessStatus
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
  TagsMeta: 'tagsmeta',
}

export const editableFields: EditableField<Tag>[] = [
  {
    name: 'id',
    label: 'Tag',
    type: fieldTypes.text,
    isEditable: false,
  },
  {
    name: 'label',
    label: 'Label',
    type: fieldTypes.text,
    hint: 'User-friendly version of the tag - will be generated from the tag if nothing is set',
  },
  {
    name: 'category',
    label: 'Category',
    type: fieldTypes.text,
    hint: `A way to group tags in the asset editor. Categories: ${Object.values(
      categories
    ).join(', ')}`,
  },
  {
    name: 'description',
    label: 'Description',
    type: fieldTypes.text,
    hint: 'A sentence that describes the tag',
  },
  {
    name: 'icon',
    label: 'Icon',
    type: fieldTypes.dropdown,
    options: Object.keys(icons).map((importName) => ({
      label: importName,
      value: importName,
    })),
    hint: 'The name of an icon',
  },
  {
    name: 'isadult',
    label: 'Is adult',
    type: fieldTypes.checkbox,
    hint: 'Hide this tag if you do not have adult content enabled (NOT CURRENTLY IN USE)',
  },
  {
    name: 'oppositetag',
    label: 'Opposite Tag',
    type: fieldTypes.text,
    hint: 'Another tag (that does not have to exist) that is the "opposite" of this tag. eg. "rigged" has opposite "unrigged"',
  },
]
