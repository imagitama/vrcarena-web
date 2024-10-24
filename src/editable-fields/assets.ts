import { EditableField } from '.'
import { fieldTypes } from '../generic-forms'
import { Asset } from '../modules/assets'

const fields: EditableField<Asset>[] = [
  {
    name: 'title',
    label: 'Title',
    type: fieldTypes.text,
  },
  {
    name: 'description',
    label: 'Description',
    type: fieldTypes.textMarkdown,
  },
  {
    name: 'thumbnailurl',
    label: 'Thumbnail URL',
    type: fieldTypes.imageUpload,
  },
  {
    name: 'pricecurrency',
    label: 'Price Currency',
    type: fieldTypes.custom, // todo: dropdown
  },
  {
    name: 'gumroad',
    label: 'Gumroad Settings',
    type: fieldTypes.custom,
  },
  {
    name: 'extrasources',
    label: 'Extra Sources',
    type: fieldTypes.custom,
  },
  {
    name: 'tags',
    label: 'Tags',
    type: fieldTypes.tags,
  },
]

export default fields
