import React, { useCallback } from 'react'
import useSupabaseView, { GetQueryFn } from '../../../../hooks/useSupabaseView'
import ReviewResults from '../../../review-results'
import LoadingIndicator from '../../../loading-indicator'
import ErrorMessage from '../../../error-message'
import NoResultsMessage from '../../../no-results-message'
import useUserOverview from '../../useUserOverview'
import { PublicReview, ViewNames } from '../../../../modules/reviews'

const ReviewsForUser = ({ userId }: { userId: string }) => {
  const getQuery = useCallback<GetQueryFn<PublicReview>>(
    (query) => query.eq('createdby', userId),
    [userId]
  )
  const [isLoading, lastErrorCode, reviews] = useSupabaseView<PublicReview>(
    ViewNames.GetPublicReviewsForPublicAssets,
    getQuery
  )

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load reviews (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (isLoading || !reviews) {
    return <LoadingIndicator message="Loading reviews..." />
  }

  if (!reviews.length) {
    return <NoResultsMessage>No reviews found</NoResultsMessage>
  }

  return <ReviewResults reviews={reviews} includeAssets />
}

export default () => {
  const { userId, user } = useUserOverview()

  if (!userId || !user) {
    return null
  }

  return <ReviewsForUser userId={userId} />
}
