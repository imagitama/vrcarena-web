export interface Collection {
  id: string
  title: string
  items: CollectionItem[]
}

export interface CollectionItem {
  asset: string
}

export interface CollectionForUser {
  id: string
  assets: string[]
}

export const CollectionNames = {
  Collections: 'collections',
  CollectionsForUsers: 'collectionsforusers',
}
