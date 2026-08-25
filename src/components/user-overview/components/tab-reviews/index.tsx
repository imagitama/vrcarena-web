import React from 'react'

import { PublicReview, ViewNames } from '@/modules/reviews'

import ReviewResults from '@/components/review-results'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'

import useUserOverview from '../../useUserOverview'
import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'

const ReviewsForUser = ({ userId }: { userId: string }) => {
  const [isLoading, lastErrorCode, reviews] = useDatabaseQuery<PublicReview>(
    ViewNames.GetPublicReviewsForPublicAssets,
    [['createdby', Operators.EQUALS, userId]]
  )

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load reviews
      </ErrorMessage>
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
