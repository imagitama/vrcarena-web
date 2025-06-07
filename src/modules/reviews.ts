import { Asset } from './assets'

export interface Review {
  id: string
  overallrating: number
  ratings: Rating[]
  comments: string
  createdat: string
  createdby: string
  asset: string
}

// @ts-ignore
export interface FullReview extends Review {
  asset: Asset
  createdbyusername: string
  createdbyavatarurl: string
}

export type PublicReview = FullReview

export interface Rating {
  name: string
  rating: number
  comments: string
}

export enum CollectionNames {
  Reviews = 'reviews',
}

export enum ViewNames {
  GetPublicReviews = 'getpublicreviews',
  GetPublicReviewsForPublicAssets = 'getpublicreviewsforpublicassets',
}
