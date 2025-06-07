import { fieldTypes } from '../generic-forms'
import { EditableField } from './'
import { BanStatus, UserMeta } from '../modules/users'

const fields: EditableField<UserMeta>[] = [
  {
    name: 'banstatus',
    label: 'Ban Status',
    type: fieldTypes.singlechoice,
    options: [BanStatus.Banned, BanStatus.Unbanned].map((val) => ({
      value: val,
      label: val,
    })),
  },
  {
    name: 'banreason',
    label: 'Ban Reason',
    type: fieldTypes.text,
    default: '',
  },
]

export default fields
