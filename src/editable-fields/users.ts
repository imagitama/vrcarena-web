import { fieldTypes } from '@/generic-forms'
import { bucketNames } from '@/file-uploading'
import { AVATAR_HEIGHT, AVATAR_WIDTH } from '@/config'
import { User } from '@/modules/users'
import type { EditableField } from './'

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
  {
    name: 'favoritespecies',
    label: 'Favorite Species ID',
    type: fieldTypes.text,
    hint: 'The internal ID of their favorite species (get it from the URL)',
  },
  {
    name: 'bio',
    label: 'Bio',
    type: fieldTypes.textMarkdown,
  },
  {
    name: 'vrchatuserid',
    label: 'VRChat user ID',
    type: fieldTypes.text,
  },
  {
    name: 'vrchatusername',
    label: 'VRChat username',
    type: fieldTypes.text,
  },
  {
    name: 'discordusername',
    label: 'Discord username',
    type: fieldTypes.text,
  },
  {
    name: 'twitterusername',
    label: 'Twitter username',
    type: fieldTypes.text,
  },
  {
    name: 'telegramusername',
    label: 'Telegram username',
    type: fieldTypes.text,
  },
  {
    name: 'youtubechannelid',
    label: 'Youtubec hannelid',
    type: fieldTypes.text,
  },
  {
    name: 'twitchusername',
    label: 'Twitch username',
    type: fieldTypes.text,
  },
  {
    name: 'neosvrusername',
    label: 'NeosVR username',
    type: fieldTypes.text,
  },
  {
    name: 'chilloutvrusername',
    label: 'ChilloutVR username',
    type: fieldTypes.text,
  },
  {
    name: 'patreonusername',
    label: 'Patreon username',
    type: fieldTypes.text,
  },
]

export default fields
