import React from 'react'

import { FullReview } from '@/modules/reviews'
import ReviewResultsItem from '@/components/review-results-item'

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
    <>
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
    </>
  )
}
