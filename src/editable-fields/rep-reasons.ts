import { RepReason } from '@/modules/reputation'
import { fieldTypes } from '@/generic-forms'
import * as icons from '@/icons'
import { EditableField } from './'

const editableFields: EditableField<RepReason>[] = [
  {
    name: 'delta',
    type: fieldTypes.int,
    label: 'Delta',
    hint: 'How much reputation to give (whole numbers only)',
    isRequired: true,
  },
  {
    name: 'description',
    type: fieldTypes.text,
    label: 'Description',
    hint: 'Short description from the perspective of another person eg. "They did something cool"',
    isRequired: true,
  },
  {
    name: 'milestonelabel',
    type: fieldTypes.text,
    label: 'Milestone Label',
    default: null,
    emptyAsNull: true,
    hint: 'A very short label shown on their profile as a "milestone". Do not specify anything to not show at all. eg. "Staff", "Champ"',
  },
  {
    name: 'icon',
    label: 'Icon',
    type: fieldTypes.dropdown,
    options: Object.keys(icons).map((importName) => ({
      label: importName,
      value: importName,
    })),
    hint: 'The name of an icon - currently used when a milestone',
  },
]

export default editableFields
