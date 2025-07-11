import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import PaginatedView, { GetQueryFn } from '../../components/paginated-view'
import ReviewResults from '../../components/review-results'
import WarningMessage from '../../components/warning-message'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { PublicReview, ViewNames } from '../../modules/reviews'
import Button from '../../components/button'
import { routes } from '../../routes'

const Renderer = ({ items }: { items?: PublicReview[] }) => (
  <ReviewResults reviews={items} includeAssets />
)

const ReviewsView = () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback<GetQueryFn<PublicReview>>(
    (query) => {
      if (!isAdultContentEnabled) {
        query = query.eq('isadult', false)
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
        <PaginatedView<PublicReview>
          viewName={ViewNames.GetPublicReviewsForPublicAssets}
          getQuery={getQuery}
          defaultFieldName="createdat"
          extraControls={[
            <Button url={routes.createReview}>Create Review</Button>,
          ]}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}

export default ReviewsView
