import React from 'react'
import { makeStyles } from '@mui/styles'

import { colorPalette } from '@/config'
import classNames from 'classnames'
import { AccessStatus, ApprovalStatus } from '@/modules/common'

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

export type Positivity = 1 | 0 | -1

export const getPositivityForAccessStatus = (
  accessStatus: AccessStatus
): Positivity => {
  switch (accessStatus) {
    case AccessStatus.Public:
      return 1
    case AccessStatus.Deleted:
      return -1
    default:
      return 0
  }
}

export const getPositivityForApprovalStatus = (
  approvalStatus: ApprovalStatus
): Positivity => {
  switch (approvalStatus) {
    case ApprovalStatus.Approved:
    case ApprovalStatus.AutoApproved:
      return 1
    case ApprovalStatus.Declined:
    case ApprovalStatus.Quarantined:
      return -1
    default:
      return 0
  }
}

const StatusText = ({
  children,
  positivity,
  className: extraClassName,
  allowWrap,
}: {
  children: React.ReactNode
  positivity?: Positivity
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
