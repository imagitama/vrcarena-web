import React from 'react'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
  star: {
    fontSize: '100%',
    '& svg': {
      fontSize: '1em',
    },
  },
  large: {
    '& $star': {
      fontSize: '150%',
    },
  },
})

export default ({
  ratingOutOf5,
  size,
}: {
  ratingOutOf5: number
  size?: 'large'
}) => {
  const classes = useStyles()

  return (
    <div className={`${classes.root} ${size ? classes[size] : ''}`}>
      {Array.from(Array(5)).map((item, idx) => (
        <div className={classes.star} key={idx}>
          {idx <= ratingOutOf5 - 1 ? <StarIcon /> : <StarOutlineIcon />}
        </div>
      ))}
    </div>
  )
}
