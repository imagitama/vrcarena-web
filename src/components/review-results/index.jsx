import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ReviewResultsItem from '../review-results-item'

const useStyles = makeStyles({})

export default ({ reviews = [], includeAssets = false, shimmer = false }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {shimmer ? (
        <>
          <ReviewResultsItem shimmer />
          <ReviewResultsItem shimmer />
          <ReviewResultsItem shimmer />
        </>
      ) : (
        reviews.map(review => (
          <ReviewResultsItem
            key={review.id}
            review={review}
            includeAsset={includeAssets}
          />
        ))
      )}
    </div>
  )
}
