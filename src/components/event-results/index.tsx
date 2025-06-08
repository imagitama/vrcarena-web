import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import EventResultsItem from '../event-results-item'
import { Event } from '../../modules/events'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
})

export default ({ events }: { events: Event[] }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {events.map((event) => (
        <EventResultsItem key={event.id} event={event} />
      ))}
    </div>
  )
}
