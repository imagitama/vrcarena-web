import React from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'

import * as routes from '../../routes'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'

import Link from '../../components/link'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import CommentList from '../../components/comment-list'
import NoPermissionMessage from '../../components/no-permission-message'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { CollectionNames, FullReview, ViewNames } from '../../modules/reviews'
import NoResultsMessage from '../../components/no-results-message'
import FormattedDate from '../../components/formatted-date'
import Markdown from '../../components/markdown'
import useIsEditor from '../../hooks/useIsEditor'
import UsernameLink from '../../components/username-link'
import AssetResultsItem from '../../components/asset-results-item'
import LoadingShimmer from '../../components/loading-shimmer'
import StarRating from '../../components/star-rating'
import ReviewRating from '../../components/review-rating'
import { allowedRatings } from '../../ratings'
import LoadingIndicator from '../../components/loading-indicator'
import ReportButton from '../../components/report-button'

const View = () => {
  const { reviewId } = useParams<{ reviewId: string }>()
  const isLoggedIn = useIsLoggedIn()
  const isEditor = useIsEditor()

  const [isLoading, lastErrorCode, review, hydrate] =
    useDataStoreItem<FullReview>(
      ViewNames.GetFullReviews,
      isLoggedIn ? reviewId : false,
      'view-review'
    )

  if (!isLoggedIn) {
    return <NoPermissionMessage />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load review (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading review..." />
  }

  if (!review) {
    return <NoResultsMessage>Review not found</NoResultsMessage>
  }

  const shimmer = isLoading

  const {
    id,
    overallrating: overallRating,
    ratings,
    comments,
    asset: assetId,
    assetdata: assetData,
    createdat,
    createdby,
    createdbyusername: createdByUsername,
    createdbyavatarurl: createdByAvatarUrl,
  } = review

  return (
    <>
      <Helmet>
        <title>Review #{reviewId} | VRCArena</title>
        <meta
          name="description"
          content={`Read more information about review #${reviewId} on the site.`}
        />
      </Helmet>
      <AssetResultsItem asset={assetData} />
      <Heading variant="h1">
        Review By{' '}
        <UsernameLink
          id={createdby}
          username={createdByUsername}
          avatarUrl={createdByAvatarUrl}
        />
      </Heading>
      <Heading variant="h2">Overall Rating</Heading>
      {shimmer ? (
        <LoadingShimmer width={200} height={50} />
      ) : (
        <StarRating ratingOutOf5={overallRating / 2} size="large" />
      )}
      {shimmer ? (
        <LoadingShimmer width={400} height={25} />
      ) : comments ? (
        <Markdown source={comments} />
      ) : null}
      {ratings.length ? <Heading variant="h2">Ratings</Heading> : null}
      {shimmer ? null : ratings.length ? (
        <div>
          {ratings.map((rating) => {
            const ratingMeta = allowedRatings.find(
              (item) => item.name === rating.name
            )!
            return <ReviewRating rating={rating} ratingMeta={ratingMeta} />
          })}
        </div>
      ) : null}
      <Heading variant="h2">Meta</Heading>
      Created <FormattedDate date={createdat} />{' '}
      {createdByUsername ? (
        <>
          by{' '}
          <Link to={routes.viewUserWithVar.replace(':userId', createdby)}>
            {createdByUsername}
          </Link>
        </>
      ) : null}
      <br />
      <br />
      <ReportButton type={CollectionNames.Reviews} id={review.id} />
      <Heading variant="h2">Comments</Heading>
      <CommentList
        collectionName={CollectionNames.Reviews}
        parentId={reviewId}
      />
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View a review | VRCArena</title>
      <meta
        name="description"
        content="Read more information about a review on the site."
      />
    </Helmet>
    <View />
  </>
)
