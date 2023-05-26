import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { ResolutionStatuses } from '../../modules/reports'
import FormattedDate from '../formatted-date'
import UsernameLink from '../username-link'
import { colorPalette } from '../../config'

const useStyles = makeStyles({
  waiting: {
    color: colorPalette.warning
  },
  resolved: {
    color: colorPalette.positive
  }
})

export default ({
  resolutionStatus,
  resolvedAt,
  resolvedBy,
  // view
  resolvedByUsername
}: {
  resolutionStatus: string // waiting | resolved
  resolvedAt: Date | null
  resolvedBy: string | null
  resolvedByUsername?: string
}) => {
  const classes = useStyles()

  return (
    <div
      className={
        resolutionStatus === ResolutionStatuses.Pending
          ? classes.waiting
          : resolutionStatus === ResolutionStatuses.Resolved
          ? classes.resolved
          : ''
      }>
      {resolutionStatus === ResolutionStatuses.Pending ? (
        'Pending Staff Input'
      ) : resolutionStatus === ResolutionStatuses.Resolved ? (
        <>
          Resolved by{' '}
          <UsernameLink
            id={resolvedBy as string}
            username={resolvedByUsername}
          />{' '}
          at <FormattedDate date={resolvedAt} />
        </>
      ) : (
        '(unknown resolution status)'
      )}
    </div>
  )
}
