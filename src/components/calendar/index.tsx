import React, { createContext, useContext, useState } from 'react'
import ReactCalendar from 'react-calendar'
import { makeStyles } from '@mui/styles'
import { View } from 'react-calendar/dist/cjs/shared/types'
import Chip from '@mui/material/Chip'

import Paper from '../paper'
import { Event } from '../../modules/events'
import { isDateInbetweenTwoDates, isDateOnSameDay } from '../../utils/dates'
import * as routes from '../../routes'
import Link from '../link'
import { VRCArenaTheme } from '../../themes'

enum EventStyle {
  StartsToday,
  InbetweenStartAndEnd,
  EndsToday,
}

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    '& button': {
      border: `1px solid ${theme.palette.divider}`,
    },
    '& button, & abbr': {
      appearance: 'none',
      outline: 'none',
      font: 'inherit',
      padding: '1rem',
      background: 'none',
      color: 'inherit',
      textDecoration: 'none',
    },
    '& .react-calendar__navigation': {
      '& button:hover': {
        cursor: 'pointer',
        background: theme.palette.background.default,
      },
    },
  },
  tile: {
    textAlign: 'left',
  },
  chip: {
    margin: '0.5rem 0.5rem 0 0',
  },
  today: {
    outline: '1px solid #FFF !important',
  },
}))

type ValuePiece = Date | null

type Value = ValuePiece | [ValuePiece, ValuePiece]

const EventItem = ({ event, style }: { event: Event; style: EventStyle }) => {
  const classes = useStyles()
  return (
    <Link to={routes.viewEventWithVar.replace(':eventId', event.id)}>
      <Chip
        label={event.name}
        className={classes.chip}
        color={style === EventStyle.StartsToday ? 'primary' : undefined}
        clickable
      />
    </Link>
  )
}

const Tile = ({ date }: { activeStartDate: Date; date: Date; view: View }) => {
  const { events } = useContext(EventsContext)
  const classes = useStyles()

  const groupedEvents = events.reduce<{
    [EventStyle.StartsToday]: Event[]
    [EventStyle.InbetweenStartAndEnd]: Event[]
    [EventStyle.EndsToday]: Event[]
  }>(
    (currentValue, event) => {
      if (isDateOnSameDay(new Date(event.startsat), date)) {
        return {
          ...currentValue,
          [EventStyle.StartsToday]: currentValue[EventStyle.StartsToday].concat(
            [event]
          ),
        }
      } else if (isDateOnSameDay(new Date(event.endsat), date)) {
        return {
          ...currentValue,
          [EventStyle.EndsToday]: currentValue[EventStyle.EndsToday].concat([
            event,
          ]),
        }
      } else if (
        isDateInbetweenTwoDates(
          date,
          new Date(event.startsat),
          new Date(event.endsat)
        )
      ) {
        return {
          ...currentValue,
          [EventStyle.InbetweenStartAndEnd]: currentValue[
            EventStyle.InbetweenStartAndEnd
          ].concat([event]),
        }
      } else {
        return currentValue
      }
    },
    {
      [EventStyle.StartsToday]: [],
      [EventStyle.InbetweenStartAndEnd]: [],
      [EventStyle.EndsToday]: [],
    }
  )

  return (
    <div className={classes.tile}>
      {groupedEvents[EventStyle.StartsToday].map((event) => (
        <EventItem
          key={event.id}
          event={event}
          style={EventStyle.StartsToday}
        />
      ))}
      {groupedEvents[EventStyle.EndsToday].map((event) => (
        <EventItem key={event.id} event={event} style={EventStyle.EndsToday} />
      ))}
      {groupedEvents[EventStyle.InbetweenStartAndEnd].map((event) => (
        <EventItem
          key={event.id}
          event={event}
          style={EventStyle.InbetweenStartAndEnd}
        />
      ))}
    </div>
  )
}

const EventsContext = createContext<{ events: Event[] }>({
  events: [],
})

const Calendar = ({ events }: { events: Event[] }) => {
  const classes = useStyles()
  const [value, onChange] = useState<Value>(new Date())

  return (
    <EventsContext.Provider value={{ events }}>
      <Paper>
        <ReactCalendar
          onChange={onChange}
          value={value}
          tileContent={Tile}
          className={classes.root}
          tileClassName={({ date }) =>
            isDateOnSameDay(new Date(), date) ? classes.today : ''
          }
        />
      </Paper>
    </EventsContext.Provider>
  )
}

export default Calendar
