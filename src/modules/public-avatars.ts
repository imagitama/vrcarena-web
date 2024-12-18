import { VrchatAvatar as VrchatAvatarData } from '../components/vrchat-avatar'

export interface CachedVrchatAvatarRecord {
  id: string
  avatar: VrchatAvatarData
}

export interface PublicAvatarSubmissions {
  id: string
  asset: string
  vrchatavatarid: string
  createdat: Date
  createdby: string
  isdeleted: string
}

export interface FullPublicAvatarSubmission extends PublicAvatarSubmissions {
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
