import { UserFieldNames } from '../hooks/useDatabaseQuery'
import { fieldTypes } from '../generic-forms'
import { bucketNames } from '../file-uploading'
import { AVATAR_HEIGHT, AVATAR_WIDTH } from '../config'
import { EditableField } from './'

const fields: EditableField<any>[] = [
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
    imageUploadProperties: {
      width: AVATAR_WIDTH,
      height: AVATAR_HEIGHT,
      bucketName: bucketNames.userAvatars
    },
    default: ''
  }
]

export default fields
