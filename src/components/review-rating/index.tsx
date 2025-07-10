import { makeStyles } from '@mui/styles'
import React from 'react'
import { VRCArenaTheme } from '../../themes'
import { Rating } from '../../modules/reviews'
import { RatingMeta } from '../../ratings'
import Markdown from '../markdown'
import StarRating from '../star-rating'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    width: '49%',
    margin: '0.5%',
    padding: '0.5rem',
    borderRadius: theme.shape.borderRadius,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
}))

const ReviewRating = ({
  rating,
  ratingMeta,
}: {
  rating: Rating
  ratingMeta: RatingMeta
}) => {
  const classes = useStyles()
  return (
    <div key={rating.name} className={classes.rating}>
      <strong title={ratingMeta.description}>{ratingMeta.title}</strong>
      <br />
      <br />
      <StarRating ratingOutOf5={rating.rating / 2} />
      <Markdown source={rating.comments} />
    </div>
  )
}

export default ReviewRating
