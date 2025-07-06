import { fieldTypes } from '../generic-forms'
import { EditableField } from './'
import { BanStatus, UserMeta } from '../modules/users'
import { AccessStatus } from '../modules/common'

const fields: EditableField<UserMeta>[] = [
  {
    name: 'banstatus',
    label: 'Ban Status',
    type: fieldTypes.singlechoice,
    options: [BanStatus.Banned, BanStatus.Unbanned].map((val) => ({
      value: val,
      label: val,
    })),
    hint: 'Prevents the user from creating or editing any data on the site (including their own profile). They can still login but will see "you do not have permission" messages everywhere.',
  },
  {
    name: 'banreason',
    label: 'Ban Reason',
    type: fieldTypes.text,
    default: '',
    hint: 'Scammer, spammer, abuse, ban evasion, custom. Shown to the banned user when they are logged in. May be shown in other places like to logged out users.',
  },
  {
    name: 'accessstatus',
    label: 'Deletion Status',
    type: fieldTypes.singlechoice,
    options: [AccessStatus.Public, AccessStatus.Deleted].map((val) => ({
      value: val,
      label: val,
    })),
    hint: '** VISUAL ONLY ** Does not prevent the user from logging in and doing anything a normal user can do.',
  },
]

export default fields
