import React from 'react'
import Markdown from '../markdown'
import { makeStyles } from '@mui/styles'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import moment from 'moment'

import Button from '../button'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import { getEventNameFromReason } from '../../events'
import Paper from '../paper'

const useStyles = makeStyles({
  root: {
    margin: '1rem 0',
    padding: '1rem',
  },
  withButton: {
    display: 'flex',
  },
  heading: {
    width: '100%',
    fontSize: '150%',
    fontWeight: 100,
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '0.5rem',
  },
  info: {
    width: '100%',
    padding: '1rem 1rem 0',
    '& p:first-child': {
      marginTop: 0,
    },
    '& p:last-child': {
      marginBottom: 0,
    },
  },
  noPadding: {
    padding: 0,
  },
  expiry: {
    marginTop: '0.5rem',
    display: 'flex',
    justifyContent: 'center',
    '& > span': {
      padding: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      borderRadius: '3px',
    },
    textAlign: 'center',
    fontSize: '150%',
    animation: '1s ease infinite alternate $pulseExpiry',
  },
  '@keyframes pulseExpiry': {
    '0%': {
      opacity: 0.5,
    },
    '100%': {
      opacity: 1,
    },
  },
  cols: {
    display: 'flex',
    alignItems: 'center',
    '& > :first-child': {
      width: '100%',
    },
  },
})

const getTimeRemaining = (date: Date): string => {
  const momentDate = moment(date)

  // Calculate the difference between the current time and the target date
  var timeDiff = momentDate.diff(moment())

  // Create a duration object from the time difference
  var duration = moment.duration(timeDiff)

  // Get the remaining days, hours, and minutes
  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()

  return `${days} days ${hours} hours ${minutes} minutes`
}

export default ({
  authorId,
  eventId,
  description,
  expiresAt,
  showTitle = true,
  showViewAuthorButton = true,
  showViewEventButton = true,
  analyticsCategory = '',
}: {
  authorId: string
  eventId: string
  description: string | null
  expiresAt: Date | null
  showTitle?: boolean
  showViewAuthorButton?: boolean
  showViewEventButton?: boolean
  analyticsCategory?: string
}) => {
  const classes = useStyles()

  if (expiresAt && expiresAt.getTime() < new Date().getTime()) {
    return null
  }

  return (
    <Paper
      margin={false}
      className={`${classes.root} ${
        showViewAuthorButton ? classes.withButton : ''
      }`}>
      <div className={classes.cols}>
        <div>
          {showTitle ? (
            <div className={classes.heading}>
              <MonetizationOnIcon className={classes.icon} /> Sale!
            </div>
          ) : null}
          {description && (
            <div
              className={`${classes.info} ${
                showTitle ? '' : classes.noPadding
              }`}>
              <Markdown source={description} />
            </div>
          )}
        </div>
        <div>
          {showViewAuthorButton && (
            <Button
              url={routes.viewAuthorWithVar.replace(':authorId', authorId)}
              onClick={
                analyticsCategory
                  ? () =>
                      trackAction(
                        analyticsCategory,
                        'Click view author for author sale info',
                        authorId
                      )
                  : undefined
              }>
              View Author
            </Button>
          )}
          {showViewEventButton && eventId !== 'other' && (
            <Button
              url={routes.viewEventWithVar.replace(':eventId', eventId)}
              onClick={
                analyticsCategory
                  ? () =>
                      trackAction(
                        analyticsCategory,
                        'Click view event for author sale info',
                        authorId
                      )
                  : undefined
              }>
              View Event
            </Button>
          )}
        </div>
      </div>

      {expiresAt ? (
        <div className={classes.expiry} title={expiresAt.toString()}>
          <span>Expires in {getTimeRemaining(expiresAt)}</span>
        </div>
      ) : null}
    </Paper>
  )
}
