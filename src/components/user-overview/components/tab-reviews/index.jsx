import React, { useCallback } from 'react'
import { ReviewsFieldNames } from '../../../../data-store'
import useSupabaseView from '../../../../hooks/useSupabaseView'
import ReviewResults from '../../../review-results'
import LoadingIndicator from '../../../loading-indicator'
import ErrorMessage from '../../../error-message'
import NoResultsMessage from '../../../no-results-message'
import useUserOverview from '../../useUserOverview'

const ReviewsForUser = ({ userId }) => {
  const getQuery = useCallback(
    (query) => query.eq(ReviewsFieldNames.createdBy, userId),
    [userId]
  )
  const [isLoading, isError, reviews] = useSupabaseView(
    'getPublicReviewsForPublicAssets',
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
