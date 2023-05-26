import React, { useCallback } from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import moment from 'moment'
import EventIcon from '@material-ui/icons/Event'

import * as routes from '../../routes'
import { CollectionNames, EventsFieldNames } from '../../data-store'
import useDataStore from '../../hooks/useDataStore'
import { client as supabase } from '../../supabase'

const useStyles = makeStyles({
  root: {
    fontSize: '90%',
    margin: '0.5rem',
    '& a': {
      color: 'inherit',
      display: 'flex',
      alignItems: 'center'
    },
    opacity: 0,
    animation: '500ms $fadeIn forwards'
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  icon: {
    marginRight: '0.5rem'
  },
  rows: {
    '& > *': {
      marginBottom: '0.5rem'
    }
  },
  rightNowIcon: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    marginLeft: '0.25rem',
    borderRadius: '100%',
    background: '#FF0000',
    animation: '500ms $pulseRightNowIcon infinite alternate'
  },
  '@keyframes pulseRightNowIcon': {
    from: {
      opacity: 1
    },
    to: {
      opacity: '0.5'
    }
  }
})

const getIsDateInFuture = date => moment(date).isAfter(moment())
const getIsDateInPast = date => moment(date).isBefore(moment())

const Contents = ({ currentEvents, futureEvents }) => {
  const classes = useStyles()

  if (currentEvents.length === 1) {
    const event = currentEvents[0]
    return (
      <div>
        "{event[EventsFieldNames.name]}"<br /> is on <strong>RIGHT NOW</strong>{' '}
        in VR! <span className={classes.rightNowIcon} />
      </div>
    )
  }

  if (currentEvents.length > 1) {
    return (
      <div>
        {currentEvents.length} events on <strong>RIGHT NOW</strong> in VR!{' '}
        <span className={classes.rightNowIcon} />
      </div>
    )
  }

  return <div>{futureEvents.length} upcoming events in VR!</div>
}

const getLinkUrl = currentEvents => {
  if (currentEvents.length === 1) {
    return routes.viewEventWithVar.replace(':eventId', currentEvents[0].id)
  }

  return routes.events
}

export default () => {
  const getQuery = useCallback(
    () =>
      supabase
        .from(CollectionNames.Events)
        .select('*')
        .gt(EventsFieldNames.endsAt, new Date().toISOString()),
    []
  )
  const [isLoading, isError, events] = useDataStore(getQuery, 'upcoming-events')
  const classes = useStyles()

  if (isLoading || !events || !events.length || isError) {
    return null
  }

  const { currentEvents, futureEvents } = events.reduce(
    (newOutput, event) => {
      const startsAt = event[EventsFieldNames.startsAt]
      const endsAt = event[EventsFieldNames.endsAt]

      if (!startsAt || !endsAt) {
        return newOutput
      }

      if (getIsDateInFuture(startsAt) && getIsDateInFuture(endsAt)) {
        return {
          ...newOutput,
          futureEvents: newOutput.futureEvents.concat([event])
        }
      }

      if (getIsDateInPast(startsAt) && getIsDateInFuture(endsAt)) {
        return {
          ...newOutput,
          currentEvents: newOutput.currentEvents.concat([event])
        }
      }

      return newOutput
    },
    {
      currentEvents: [],
      futureEvents: []
    }
  )

  return (
    <div className={classes.root}>
      <Link to={getLinkUrl(currentEvents, futureEvents)}>
        <div className={classes.icon}>
          <EventIcon />
        </div>
        <div className={classes.rows}>
          <Contents currentEvents={currentEvents} futureEvents={futureEvents} />
        </div>
      </Link>
    </div>
  )
}
