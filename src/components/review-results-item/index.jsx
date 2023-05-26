import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { ReviewsFieldNames, ReviewsRatingsFieldNames } from '../../data-store'
import { allowedRatings } from '../../ratings'

import Paper from '../paper'
import Markdown from '../markdown'
import StarRating from '../star-rating'
import Avatar, { sizes } from '../avatar'
import UsernameLink from '../username-link'
import AssetResultsItem from '../asset-results-item'
import LoadingShimmer from '../loading-shimmer'
import Expander from '../expander'

const useStyles = makeStyles({
  root: {},
  asset: {
    marginBottom: '1rem'
  },
  review: {
    display: 'flex',
    marginBottom: '1rem'
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 1rem 0 0'
  },
  username: {
    fontSize: '75%',
    marginTop: '0.25rem'
  },
  ratings: {
    marginTop: '0.5rem',
    display: 'flex',
    flexWrap: 'wrap'
  },
  rating: {
    width: '49%',
    margin: '0.5%',
    padding: '0.5rem',
    borderRadius: '4px', // todo: get from theme
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  content: {
    width: '100%'
  }
})

const GetPublicReviewsFieldNames = {
  asset: 'asset',
  createdById: 'createdbyid',
  createdByUsername: 'createdbyusername',
  createdByAvatarUrl: 'createdbyavatarurl'
}

export default ({ review = {}, includeAsset = false, shimmer = false }) => {
  const classes = useStyles()

  return (
    <Expander message="Click to expand review">
      {includeAsset && (
        <div className={classes.asset}>
          <AssetResultsItem
            asset={review[GetPublicReviewsFieldNames.asset]}
            isLandscape
          />
        </div>
      )}
      <div className={classes.review}>
        <div className={classes.meta}>
          {shimmer ? (
            <LoadingShimmer width={50} height={50} />
          ) : (
            <Avatar
              url={review[GetPublicReviewsFieldNames.createdByAvatarUrl]}
              size={sizes.TINY}
            />
          )}
          <span className={classes.username}>
            {shimmer ? (
              <LoadingShimmer width={100} height={25} />
            ) : (
              <UsernameLink
                username={review[GetPublicReviewsFieldNames.createdByUsername]}
                id={review[GetPublicReviewsFieldNames.createdById]}
              />
            )}
          </span>
        </div>

        <Paper className={classes.content}>
          {shimmer ? (
            <LoadingShimmer width={200} height={50} />
          ) : (
            <StarRating
              ratingOutOf5={review[ReviewsFieldNames.overallRating] / 2}
              size="large"
            />
          )}
          {shimmer ? (
            <LoadingShimmer width={400} height={25} />
          ) : (
            <Markdown source={review[ReviewsFieldNames.comments]} />
          )}
          {shimmer ? null : review[ReviewsFieldNames.ratings].length ? (
            <div className={classes.ratings}>
              {review[ReviewsFieldNames.ratings].map(rating => {
                const ratingMeta = allowedRatings.find(
                  item => item.name === rating[ReviewsRatingsFieldNames.name]
                )
                return (
                  <div
                    key={rating[ReviewsRatingsFieldNames.name]}
                    className={classes.rating}>
                    <strong title={ratingMeta.description}>
                      {ratingMeta.title}
                    </strong>
                    <br />
                    <br />
                    <StarRating
                      ratingOutOf5={rating[ReviewsRatingsFieldNames.rating] / 2}
                    />
                    <Markdown
                      source={rating[ReviewsRatingsFieldNames.comments]}
                    />
                  </div>
                )
              })}
            </div>
          ) : null}
        </Paper>
      </div>
    </Expander>
  )
}
