import React from 'react'
import { makeStyles } from '@mui/styles'

import { ResolutionStatus } from '@/modules/reports'
import { colorPalette } from '@/config'

import FormattedDate from '@/components/formatted-date'
import UsernameLink from '@/components/username-link'

const useStyles = makeStyles({
  root: {
    fontWeight: 'bold',
  },
  waiting: {
    color: colorPalette.warning,
  },
  resolved: {
    color: colorPalette.positive,
  },
})

export default ({
  resolutionStatus,
  resolvedAt,
  resolvedBy,
  // view
  resolvedByUsername,
}: {
  resolutionStatus: string // waiting | resolved
  resolvedAt: Date | string | null
  resolvedBy: string | null
  resolvedByUsername?: string
}) => {
  const classes = useStyles()

  return (
    <div
      className={`${classes.root} ${
        resolutionStatus === ResolutionStatus.Pending
          ? classes.waiting
          : resolutionStatus === ResolutionStatus.Resolved
          ? classes.resolved
          : ''
      }`}>
      {resolutionStatus === ResolutionStatus.Pending ? (
        'Pending Staff Input'
      ) : resolutionStatus === ResolutionStatus.Resolved ? (
        <>
          Resolved by{' '}
          <UsernameLink
            id={resolvedBy as string}
            username={resolvedByUsername}
          />{' '}
          {resolvedAt !== null ? (
            <FormattedDate date={resolvedAt} />
          ) : (
            '(no date)'
          )}
        </>
      ) : (
        '(unknown resolution status)'
      )}
    </div>
  )
}
