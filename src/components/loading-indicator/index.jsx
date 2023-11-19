import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { ReactComponent as Chariot } from '../../assets/images/chariot.svg'

const useStyles = makeStyles(() => ({
  progress: {
    display: 'block',
    margin: '0 auto',
  },
  message: {
    marginTop: '1rem',
    textAlign: 'center',
    fontWeight: 100,
    fontSize: '125%',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: '7.5rem',
    height: '7.5rem',
    '& svg': {
      width: '100%',
      height: '100%',
    },
    '& #g23412': {
      transformOrigin: 'center',
      transformBox: 'fill-box',
      animation: '$spinWheel 1s linear infinite',
    },
  },
  '@keyframes spinWheel': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}))

function LoadingIndicator({ message = '' }) {
  const classes = useStyles()
  return (
    <>
      <div className={classes.iconWrapper}>
        <div className={classes.icon}>
          <Chariot />
        </div>
      </div>
      {message && <div className={classes.message}>{message}</div>}
    </>
  )
}

export default LoadingIndicator
