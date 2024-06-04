export interface Collection {
  id: string
  title: string
  items: CollectionItem[]
  createdat: string
}

export interface CollectionItem {
  asset: string
}

export interface CollectionForUser {
  id: string
  assets: string[]
}

export enum CollectionNames {
  Collections = 'playlists', // TODO: rename
  CollectionsForUsers = 'collectionsforusers',
}

export enum ViewNames {
  GetPublicCollections = 'getpublicplaylists',
}
