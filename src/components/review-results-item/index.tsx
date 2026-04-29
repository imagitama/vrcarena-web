import React from 'react'
import { makeStyles } from '@mui/styles'

import { allowedRatings } from '@/ratings'
import { FullReview } from '@/modules/reviews'
import { VRCArenaTheme } from '@/themes'
import { routes } from '@/routes'

import Paper from '@/components/paper'
import Markdown from '@/components/markdown'
import StarRating from '@/components/star-rating'
import Avatar, { AvatarSize } from '@/components/avatar'
import UsernameLink from '@/components/username-link'
import AssetResultsItem from '@/components/asset-results-item'
import LoadingShimmer from '@/components/loading-shimmer'
import Expander from '@/components/expander'
import ReviewRating from '@/components/review-rating'
import Button from '@/components/button'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {},
  asset: {
    marginBottom: '1rem',
  },
  review: {
    display: 'flex',
    marginBottom: '1rem',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 1rem 0 0',
  },
  username: {
    fontSize: '75%',
    marginTop: '0.25rem',
  },
  ratings: {
    marginTop: '0.5rem',
    display: 'flex',
    flexWrap: 'wrap',
  },
  rating: {
    width: '49%',
    margin: '0.5%',
    padding: '0.5rem',
    borderRadius: theme.shape.borderRadius,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  content: {
    width: '100%',
  },
}))

export default ({
  review,
  includeAsset = false,
  shimmer = false,
}: {
  review?: FullReview
  includeAsset?: boolean
  shimmer?: boolean
}) => {
  const classes = useStyles()

  return (
    <Expander message="Click to expand review">
      {includeAsset && review && (
        <div className={classes.asset}>
          <AssetResultsItem asset={review!.assetdata} />
        </div>
      )}
      <div className={classes.review}>
        <div className={classes.meta}>
          {shimmer ? (
            <LoadingShimmer width={50} height={50} />
          ) : (
            <Avatar url={review!.createdbyavatarurl} size={AvatarSize.Tiny} />
          )}
          <span className={classes.username}>
            {shimmer ? (
              <LoadingShimmer width={100} height={25} />
            ) : (
              <UsernameLink
                username={review!.createdbyusername}
                id={review!.createdby}
              />
            )}
          </span>
        </div>

        <Paper className={classes.content}>
          {shimmer ? (
            <LoadingShimmer width={200} height={50} />
          ) : (
            <StarRating ratingOutOf5={review!.overallrating / 2} size="large" />
          )}
          {shimmer ? (
            <LoadingShimmer width={400} height={25} />
          ) : (
            <Markdown source={review!.comments} />
          )}
          {shimmer ? null : review!.ratings.length ? (
            <div className={classes.ratings}>
              {review!.ratings.map((rating) => {
                const ratingMeta = allowedRatings.find(
                  (item) => item.name === rating.name
                )!
                return <ReviewRating rating={rating} ratingMeta={ratingMeta} />
              })}
            </div>
          ) : null}
        </Paper>
      </div>
      {review && (
        <Button
          url={routes.viewReviewWithVar.replace(':reviewId', review.id)}
          color="secondary">
          View Full Review
        </Button>
      )}
    </Expander>
  )
}
