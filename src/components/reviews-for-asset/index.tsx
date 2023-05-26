import React, { useCallback } from 'react'
import useDataStore from '../../hooks/useDataStore'
import { ReviewsFieldNames } from '../../data-store'
import { client as supabase } from '../../supabase'

import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import ReviewResults from '../review-results'
import { Review } from '../../modules/reviews'

export default ({
  assetId,
  shimmer = false
}: {
  assetId: string
  shimmer?: boolean
}) => {
  const getQuery = useCallback(
    () =>
      shimmer
        ? null
        : supabase
            .from('getPublicReviews'.toLowerCase())
            .select('*')
            .eq(ReviewsFieldNames.asset, assetId),
    [assetId, shimmer]
  )
  const [isLoading, isError, reviews] = useDataStore<Review[]>(
    getQuery,
    'reviews-by-asset-id'
  )

  if (isLoading || shimmer) {
    return (
      <>
        <ReviewResults shimmer />
      </>
    )
  }

  if (isError) {
    return <ErrorMessage>Failed to load reviews</ErrorMessage>
  }

  if (!reviews || !reviews.length) {
    return <NoResultsMessage>No reviews found</NoResultsMessage>
  }

  return <ReviewResults reviews={reviews} />
}
