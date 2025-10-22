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
  className: extraClassName,
}: {
  children: React.ReactNode
  positivity: number
  className?: string
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

  return (
    <span className={`${classes.status} ${className} ${extraClassName || ''}`}>
      {children}
    </span>
  )
}

export default StatusText
