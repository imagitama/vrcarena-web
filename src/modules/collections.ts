export interface Collection {
  id: string
  title: string
  items: CollectionItem[]
}

export interface CollectionItem {
  asset: string
}
