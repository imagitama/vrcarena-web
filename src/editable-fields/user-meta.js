import { UserMetaFieldNames, BanStatuses } from '../hooks/useDatabaseQuery'
import { fieldTypes } from '../generic-forms'

export default [
  {
    name: UserMetaFieldNames.banStatus,
    label: 'Ban Status',
    type: fieldTypes.singlechoice,
    options: [
      BanStatuses.Banned,
      BanStatuses.Unbanned,
    ].map(val => ({
      value: val,
      label: val
    }))
  },
  {
    name: UserMetaFieldNames.banReason,
    label: 'Ban Reason',
    type: fieldTypes.text,
    default: ''
  }
]
