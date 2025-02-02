export interface WishlistForUser extends Record<string, unknown> {
  id: string
  assets: string[]
}

export const CollectionNames = {
  WishlistsForUsers: 'wishlistsforusers',
}
