export interface UnityPackage {
  platform: 'android' | 'standalonewindows'
}

export interface VrchatAvatar {
  id: string
  imageUrl: string
  name: string
  authorName: string
  created_at: string
  updated_at: string
  description: string
  release_status: string
  unityPackages: UnityPackage[]
}

export interface VrchatWorld {
  id: string
  imageUrl: string
  authorId: string
  authorName: string
  capacity: number
  created_at: string
  description: string
  favorites: number
  featured: boolean
  heat: number
  instances: any[]
  labsPublicationDate: string
  name: string
  namespace: string
  occupants: number
  organization: 'vrchat'
  popularity: number
  previewYoutubeId: string
  privateOccupants: number
  publicOccupants: number
  publicationDate: string
  releaseStatus: 'public'
  tags: string[]
  thumbnailImageUrl: string
  unityPackages: any[]
  updated_at: string
  version: number
  visits: number
}
