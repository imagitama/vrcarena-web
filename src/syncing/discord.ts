import { FullUser } from '../modules/users'
import { SyncFieldTypes, SyncPlatformName, SyncPlatformInfo } from './'

const gumroad: SyncPlatformInfo<FullUser> = {
  platformName: SyncPlatformName.Discord,
  fields: [
    {
      ourName: 'username',
      type: SyncFieldTypes.Text,
      label: 'Username',
    },
    {
      ourName: 'avatarurl',
      type: SyncFieldTypes.ImageUrl,
      label: 'Avatar',
    },
  ],
}

export default gumroad
