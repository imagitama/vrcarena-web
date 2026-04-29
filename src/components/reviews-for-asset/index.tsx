import React, { useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import useDataStore from '@/hooks/useDataStore'
import { FullReview, ViewNames } from '@/modules/reviews'

import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'
import ReviewResults from '@/components/review-results'

export default ({
  assetId,
  shimmer = false,
}: {
  assetId: string
  shimmer?: boolean
}) => {
  const getQuery = useCallback(
    (supabase: SupabaseClient) =>
      shimmer
        ? null
        : supabase
            .from(ViewNames.GetPublicReviews)
            .select('*')
            .eq('asset', assetId),
    [assetId, shimmer]
  )
  const [isLoading, lastErrorCode, reviews] = useDataStore<FullReview>(
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

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load reviews (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (!reviews || !reviews.length) {
    return <NoResultsMessage>No reviews found</NoResultsMessage>
  }

  return <ReviewResults reviews={reviews} />
}
