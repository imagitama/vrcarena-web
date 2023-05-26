export interface Review {
  id: string
  overallrating: number
  ratings: Rating[]
  comments: string
}

export interface Rating {
  name: string
  rating: number
  comments: string
}
