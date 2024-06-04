import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import PaginatedView from '../../components/paginated-view'
import ReviewResults from '../../components/review-results'
import WarningMessage from '../../components/warning-message'
import { AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { Review, ViewNames } from '../../modules/reviews'

const Renderer = ({ items }: { items?: Review[] }) => (
  <ReviewResults reviews={items} includeAssets />
)

const ReviewsView = () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    (query) => {
      if (!isAdultContentEnabled) {
        query = query.eq(AssetFieldNames.isAdult, false)
      }
      return query
    },
    [isAdultContentEnabled]
  )

  return (
    <>
      <Helmet>
        <title>Browse reviews of assets | VRCArena</title>
        <meta
          name="description"
          content="A list of user reviews of our avatars, accessories, etc."
        />
      </Helmet>
      <div>
        <Heading variant="h1">Reviews</Heading>
        <WarningMessage>
          Please contact us if you believe a review contains incorrect info or
          is very unfair or unjust.
        </WarningMessage>
        <PaginatedView<Review>
          viewName={ViewNames.GetPublicReviewsForPublicAssets}
          getQuery={getQuery}
          defaultFieldName="createdat">
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}

export default ReviewsView
