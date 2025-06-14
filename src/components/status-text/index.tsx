import React from 'react'
import { makeStyles } from '@mui/styles'
import { colorPalette } from '../../config'

const useStyles = makeStyles({
  status: {
    fontWeight: 'bold',
  },
  good: {
    color: colorPalette.positive,
  },
  average: {
    color: colorPalette.warning,
  },
  bad: {
    color: colorPalette.negative,
  },
})

const StatusText = ({
  children,
  positivity,
}: {
  children: React.ReactNode
  positivity: number
}) => {
  const classes = useStyles()

  const className =
    positivity === 1
      ? classes.good
      : positivity === 0
      ? classes.average
      : positivity === -1
      ? classes.bad
      : ''

  return <div className={`${classes.status} ${className}`}>{children}</div>
}

export default StatusText
