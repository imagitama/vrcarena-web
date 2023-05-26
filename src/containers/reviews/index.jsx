import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import PaginatedView from '../../components/paginated-view'
import ReviewResults from '../../components/review-results'
import WarningMessage from '../../components/warning-message'

import { ReviewsFieldNames } from '../../data-store'
import { AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'

const Renderer = ({ items }) => {
  return <ReviewResults reviews={items} includeAssets />
}

export default () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    query => {
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
        <PaginatedView
          viewName="getPublicReviewsForPublicAssets"
          getQuery={getQuery}
          defaultFieldName={ReviewsFieldNames.createdAt}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}
