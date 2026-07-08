import { VrchatAvatar } from '@/vrchat'
import { VrchatAvatarCachedItem } from './vrchat-cache'
import { AssetForList } from './assets'

export interface PublicAvatarSubmission {
  id: string
  asset: string
  vrchatavatarid: string
  createdat: Date
  createdby: string
  isdeleted: string
}

export interface FullPublicAvatarSubmission extends PublicAvatarSubmission {
  assetdata: AssetForList | null
  creatorname: string
  existingavatarids: string[]
  existingavatardata: VrchatAvatarCachedItem[]
  avatar?: VrchatAvatar
}

export enum CollectionNames {
  PublicAvatarSubmissions = 'publicavatarsubmissions',
}

export enum ViewNames {
  GetFullPublicAvatarSubmissions = 'getfullpublicavatarsubmissions',
}
