import { VrchatAvatar as VrchatAvatarData } from '../components/vrchat-avatar'

export interface CachedVrchatAvatarRecord {
  id: string
  avatar: VrchatAvatarData
}

export interface FullPublicAvatarSubmission {
  id: string
  asset: string
  vrchatavatarid: string
  createdat: Date
  createdby: string
  // joined
  creatorname: string
  title: string
  thumbnailurl: string
  existingavatarids: string[]
  existingavatardata: CachedVrchatAvatarRecord[]
  avatar?: VrchatAvatarData
}

export const CollectionNames = {
  PublicAvatarSubmissions: 'publicavatarsubmissions',
}
