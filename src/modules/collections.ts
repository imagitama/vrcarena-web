import { PublicAsset } from './assets'

export interface Collection {
  id: string
  title: string
  description: string
  thumbnailurl: string
  items: CollectionItem[]
  createdat: string
}

export interface CollectionItem {
  asset: string
}

// different table = different cols
export interface CollectionForUser {
  id: string
  assets: string[]
}

export interface FullCollection extends Collection {
  itemsassetdata: PublicAsset[]
  createdbyusername: string
  createdbyavatarurl: string
}

export enum CollectionNames {
  Collections = 'playlists', // TODO: rename
  CollectionsForUsers = 'collectionsforusers',
}

export enum ViewNames {
  GetPublicCollections = 'getpublicplaylists',
  GetFullCollections = 'getfullplaylists',
}
