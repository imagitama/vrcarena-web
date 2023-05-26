import React from 'react'
import StarIcon from '@material-ui/icons/Star'
import StarOutlineIcon from '@material-ui/icons/StarOutline'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    display: 'flex'
  },
  star: {
    fontSize: '100%',
    '& svg': {
      fontSize: '1em'
    }
  },
  large: {
    '& $star': {
      fontSize: '150%'
    }
  }
})

export default ({ ratingOutOf5, size = '' }) => {
  const classes = useStyles()

  return (
    <div className={`${classes.root} ${classes[size]}`}>
      {Array.from(Array(5)).map((item, idx) => (
        <div className={classes.star} key={idx}>
          {idx <= ratingOutOf5 - 1 ? <StarIcon /> : <StarOutlineIcon />}
        </div>
      ))}
    </div>
  )
}
