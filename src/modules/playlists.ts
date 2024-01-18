export interface PlaylistItem {
  asset: string
  comments: string
}

export interface Playlist {
  items: PlaylistItem[]
}

export const CollectionNames = {
  Playlists: 'playlists',
}
