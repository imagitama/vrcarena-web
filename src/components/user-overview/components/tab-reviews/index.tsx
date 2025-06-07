import React, { useCallback } from 'react'
import useSupabaseView from '../../../../hooks/useSupabaseView'
import ReviewResults from '../../../review-results'
import LoadingIndicator from '../../../loading-indicator'
import ErrorMessage from '../../../error-message'
import NoResultsMessage from '../../../no-results-message'
import useUserOverview from '../../useUserOverview'
import { PublicReview, ViewNames } from '../../../../modules/reviews'

const ReviewsForUser = ({ userId }: { userId: string }) => {
  const getQuery = useCallback(
    (query) => query.eq('createdby', userId),
    [userId]
  )
  const [isLoading, isError, reviews] = useSupabaseView<PublicReview>(
    ViewNames.GetPublicReviewsForPublicAssets,
    getQuery
  )

  if (isError) {
    return <ErrorMessage>Failed to load reviews</ErrorMessage>
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
