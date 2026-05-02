import React from 'react'
import { makeStyles } from '@mui/styles'

import Chariot from '@/components/chariot'

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
  className = '',
}: {
  message?: React.ReactNode
  fill?: boolean
  className?: string
}) => {
  const classes = useStyles()
  return (
    <div className={className}>
      <div className={classes.iconWrapper}>
        <div className={`${classes.icon} ${fill ? classes.fill : ''}`}>
          <Chariot spin />
        </div>
      </div>
      {message && <div className={classes.message}>{message}</div>}
    </div>
  )
}

export default LoadingIndicator
