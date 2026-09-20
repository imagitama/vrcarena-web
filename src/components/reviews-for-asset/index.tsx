import React, { useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import { FullReview, ViewNames } from '@/modules/reviews'

import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'
import ReviewResults from '@/components/review-results'
import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'

export default ({
  assetId,
  shimmer = false,
}: {
  assetId: string
  shimmer?: boolean
}) => {
  // TODO: move to getFullAssetsExtra
  const [isLoading, lastErrorCode, reviews] = useDatabaseQuery<FullReview>(
    ViewNames.GetPublicReviews,
    [['asset', Operators.EQUALS, assetId]],
    { queryName: 'reviews-by-asset-id' }
  )

  if (isLoading || shimmer) {
    return <ReviewResults shimmer />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load reviews
      </ErrorMessage>
    )
  }

  if (!reviews || !reviews.length) {
    return <NoResultsMessage>No reviews found</NoResultsMessage>
  }

  return <ReviewResults reviews={reviews} showAsset={false} />
}
