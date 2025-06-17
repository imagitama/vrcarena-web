import React from 'react'
import { makeStyles } from '@mui/styles'
import Chariot from '../chariot'

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
  },
  fill: {
    width: 'auto',
    height: '100%',
  },
}))

const LoadingIndicator = ({
  message = '',
  fill = false,
}: {
  message?: React.ReactNode
  fill?: boolean
}) => {
  const classes = useStyles()
  return (
    <>
      <div className={classes.iconWrapper}>
        <div className={`${classes.icon} ${fill ? classes.fill : ''}`}>
          <Chariot spin />
        </div>
      </div>
      {message && <div className={classes.message}>{message}</div>}
    </>
  )
}

export default LoadingIndicator
