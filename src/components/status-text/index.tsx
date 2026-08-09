import React from 'react'
import { makeStyles } from '@mui/styles'

import { colorPalette } from '@/config'
import classNames from 'classnames'

const useStyles = makeStyles({
  status: {
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  wrap: {
    whiteSpace: 'wrap',
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
  allowWrap,
}: {
  children: React.ReactNode
  positivity?: number
  className?: string
  allowWrap?: boolean
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
    <span
      className={classNames(classes.status, className, extraClassName, {
        [classes.wrap]: allowWrap,
      })}>
      {children}
    </span>
  )
}

export default StatusText
