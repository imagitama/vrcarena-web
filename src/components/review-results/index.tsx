import React from 'react'
import ReviewResultsItem from '../review-results-item'
import { FullReview } from '../../modules/reviews'

export default ({
  reviews = [],
  includeAssets = false,
  shimmer = false,
}: {
  reviews?: FullReview[]
  includeAssets?: boolean
  shimmer?: boolean
}) => {
  return (
    <div>
      {shimmer ? (
        <>
          <ReviewResultsItem shimmer />
          <ReviewResultsItem shimmer />
          <ReviewResultsItem shimmer />
        </>
      ) : (
        reviews.map((review) => (
          <ReviewResultsItem
            key={review.id}
            review={review}
            includeAsset={includeAssets}
          />
        ))
      )}
    </div>
  )
}
