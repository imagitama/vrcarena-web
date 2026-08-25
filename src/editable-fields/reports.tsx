import { getReasonsForCollectionName, Report } from '@/modules/reports'
import { EditableField } from '.'
import { fieldTypes } from '@/generic-forms'
import GenericOutputItem from '@/components/generic-output-item'

const editableFields: EditableField<Report>[] = [
  {
    name: 'parenttable',
    type: fieldTypes.custom,
    renderer: ({ formFields }) => (
      <GenericOutputItem type={formFields.parenttable} id={formFields.parent} />
    ),
  },
  {
    name: 'parent',
    type: fieldTypes.hidden,
  },
  {
    name: 'reason',
    label: 'Reason',
    type: fieldTypes.dropdown,
    options: (fields) =>
      fields.parenttable
        ? getReasonsForCollectionName(fields.parenttable).map((meta) => ({
            value: meta.value,
            label: meta.label,
            subLabel: meta.description,
          }))
        : [],
    hint: ' Before submitting a takedown request please ensure you have read our takedown policy',
    isRequired: true,
  },
  {
    name: 'comments',
    label: 'Comments',
    type: fieldTypes.text,
    hint: 'Explain your reasoning. Provide evidence if necessary.',
    multiline: true,
    isRequired: true,
  },
]

export default editableFields
