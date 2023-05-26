import { UserFieldNames } from '../hooks/useDatabaseQuery'
import { fieldTypes } from '../generic-forms'

export default [
  {
    name: UserFieldNames.username,
    label: 'Username',
    type: fieldTypes.text,
    isRequired: true
  },
  {
    name: UserFieldNames.avatarUrl,
    label: 'Avatar image URL',
    type: fieldTypes.imageUpload,
    fieldProperties: {
      directoryName: 'avatars',
      width: 200,
      height: 200
    },
    default: ''
  }
]
