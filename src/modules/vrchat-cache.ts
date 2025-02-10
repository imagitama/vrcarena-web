import { VrchatAvatar } from '../vrchat'

export interface VrchatAvatarCachedItem {
  id: string // uuid
  avatar: VrchatAvatar
  thumbnailurl: string // converted to webp on our servers
  fetchedat: string // date
}
