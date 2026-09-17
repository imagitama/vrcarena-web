import React, { useCallback } from 'react'
import { Helmet } from '@unhead/react/helmet'

import { PublicReview, ViewNames } from '@/modules/reviews'
import { routes } from '@/routes'

import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'

import Heading from '@/components/heading'
import PaginatedView, { GetQueryFn } from '@/components/paginated-view'
import ReviewResults from '@/components/review-results'
import Button from '@/components/button'
import { OrderDirections } from '@/hooks/useDatabaseQuery'

const Renderer = ({ items }: { items?: PublicReview[] }) => (
  <ReviewResults reviews={items} />
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
        <title>Browse reviews of assets</title>
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
          defaultDirection={OrderDirections.DESC}
          extraControls={[
            <Button url={routes.createReview}>Create Review</Button>,
          ]}
          sortOptions={[
            {
              label: 'Overall Rating',
              fieldName: 'overallrating',
            },
            {
              label: 'Submission date',
              fieldName: 'createdat',
            },
          ]}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}

export default ReviewsView
