import { fieldTypes } from '../generic-forms'
import { bucketNames } from '../file-uploading'
import { AVATAR_HEIGHT, AVATAR_WIDTH } from '../config'
import { EditableField } from './'
import { User } from '../modules/users'

const fields: EditableField<User>[] = [
  {
    name: 'username',
    label: 'Username',
    type: fieldTypes.text,
    isRequired: true,
  },
  {
    name: 'avatarurl',
    label: 'Avatar image URL',
    type: fieldTypes.imageUpload,
    requiredWidth: AVATAR_WIDTH,
    requiredHeight: AVATAR_HEIGHT,
    bucketName: bucketNames.userAvatars,
    default: '',
  },
]

export default fields
