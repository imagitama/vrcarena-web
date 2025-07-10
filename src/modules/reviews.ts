import { Asset } from './assets'

export interface ReviewFields extends Record<string, any> {
  overallrating: number
  ratings: Rating[]
  comments: string
  createdat: string
  createdby: string
  asset: string
}

export interface Review extends ReviewFields {
  id: string
}

// @ts-ignore
export interface FullReview extends Review {
  assetdata: Asset
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
  GetFullReviews = 'getfullreviews',
}
