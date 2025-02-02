import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import Button from '../../components/button'
import EventResults from '../../components/event-results'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import NoResultsMessage from '../../components/no-results-message'

import * as routes from '../../routes'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import useDataStore from '../../hooks/useDataStore'
import { Event, ViewNames } from '../../modules/events'
import Calendar from '../../components/calendar'
import { getIsDateInFuture, getIsDateInPast } from '../../utils/dates'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { SupabaseClient } from '@supabase/supabase-js'

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
})

function Events() {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    (supabase: SupabaseClient) => {
      let query = supabase
        .from(ViewNames.GetPublicEvents)
        .select<any, Event>('*')
      query =
        isAdultContentEnabled === false ? query.is('isadult', false) : query
      return query
    },
    [isAdultContentEnabled]
  )
  const [isLoading, lastErrorCode, events] = useDataStore<Event>(
    getQuery,
    'events'
  )

  if (isLoading || !events) {
    return <LoadingIndicator message="Loading events..." />
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to load events</ErrorMessage>
  }

  const { pastEvents, currentEvents, futureEvents } = events.reduce<{
    pastEvents: Event[]
    currentEvents: Event[]
    futureEvents: Event[]
  }>(
    (newOutput, event) => {
      const startsAt = event.startsat
      const endsAt = event.endsat

      if (!startsAt || !endsAt) {
        return newOutput
      }

      if (getIsDateInFuture(startsAt) && getIsDateInFuture(endsAt)) {
        return {
          ...newOutput,
          futureEvents: newOutput.futureEvents.concat([event]),
        }
      }

      if (getIsDateInPast(startsAt) && getIsDateInFuture(endsAt)) {
        return {
          ...newOutput,
          currentEvents: newOutput.currentEvents.concat([event]),
        }
      }

      return {
        ...newOutput,
        pastEvents: newOutput.pastEvents.concat([event]),
      }
    },
    {
      pastEvents: [],
      currentEvents: [],
      futureEvents: [],
    }
  )

  return (
    <>
      <Heading variant="h2">Calendar</Heading>
      <Calendar events={events} />
      {currentEvents.length ? (
        <>
          <Heading variant="h2">Today</Heading>
          <EventResults events={currentEvents} />
        </>
      ) : null}
      <Heading variant="h2">Upcoming</Heading>
      {futureEvents.length ? (
        <EventResults events={futureEvents} />
      ) : (
        <NoResultsMessage />
      )}
      <Heading variant="h2">Past</Heading>
      {pastEvents.length ? (
        <EventResults events={pastEvents} />
      ) : (
        <NoResultsMessage />
      )}
    </>
  )
}

export default () => {
  const classes = useStyles()
  const isLoggedIn = useIsLoggedIn()

  return (
    <>
      <Helmet>
        <title>View all events | VRCArena</title>
        <meta
          name="description"
          content="Browse the events that are being hosted in or about VRChat and other VR social games."
        />
      </Helmet>
      <div className={classes.root}>
        <Heading variant="h1">
          <Link to={routes.events}>Events</Link>
        </Heading>
        <BodyText>A list of all past, present and future events.</BodyText>
        {isLoggedIn && (
          <Button url={routes.createEvent} icon={<AddIcon />}>
            Create Event
          </Button>
        )}
        <Events />
      </div>
    </>
  )
}
