import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

const useStyles = makeStyles({
  root: {
    margin: '0 auto 1rem',
    maxWidth: '1280px',
    display: 'flex',
    [mediaQueryForTabletsOrBelow]: {
      flexDirection: 'column'
    }
  },
  col: {
    width: '50%',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  },
  rightCol: {
    display: 'flex',
    alignItems: 'center'
  }
})

export default ({ leftCol, rightCol }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={`${classes.col} ${classes.leftCol}`}>{leftCol}</div>
      <div className={`${classes.col} ${classes.rightCol}`}>{rightCol}</div>
    </div>
  )
}
