export interface Review {
  id: string
  overallrating: number
  ratings: Rating[]
  comments: string
  createdat: string
  createdby: string
  asset: string
}

export interface Rating {
  name: string
  rating: number
  comments: string
}

export enum CollectionNames {
  Reviews = 'reviews',
}

export enum ViewNames {
  GetPublicReviewsForPublicAssets = 'getpublicreviewsforpublicassets',
}
