import { VrchatAvatar } from '../vrchat'
import { VrchatAvatarCachedItem } from './vrchat-cache'

export interface PublicAvatarSubmission {
  id: string
  asset: string
  vrchatavatarid: string
  createdat: Date
  createdby: string
  isdeleted: string
}

export interface FullPublicAvatarSubmission extends PublicAvatarSubmission {
  creatorname: string
  title: string
  thumbnailurl: string
  existingavatarids: string[]
  existingavatardata: VrchatAvatarCachedItem[]
  avatar?: VrchatAvatar
}

export const CollectionNames = {
  PublicAvatarSubmissions: 'publicavatarsubmissions',
}
