export interface WishlistForUser extends Record<string, unknown> {
  id: string
  assets: string[]
}

export enum CollectionNames {
  WishlistsForUsers = 'wishlistsforusers',
}
