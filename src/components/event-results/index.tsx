import React from 'react'
import { makeStyles } from '@mui/styles'
import EventResultsItem from '../event-results-item'
import { Event } from '../../modules/events'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
})

const EventResults = ({ events }: { events: Event[] }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {events.map((event) => (
        <EventResultsItem key={event.id} event={event} />
      ))}
    </div>
  )
}

export default EventResults
