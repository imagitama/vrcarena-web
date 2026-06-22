import React, { createContext, useContext, useState } from 'react'
import ReactCalendar from 'react-calendar'
import type { View } from 'react-calendar/dist/shared/types.js'
import { makeStyles } from '@mui/styles'
import styled from '@emotion/styled'

import Paper from '@/components/paper'
import { Event } from '@/modules/events'
import {
  formatWithoutTime,
  getFormattedDate,
  getIsDateInbetweenTwoDates,
  getIsDateOnSameDay,
} from '@/utils/dates'
import * as routes from '@/routes'
import Link from '@/components/link'
import { colorGreyedOut, VRCArenaTheme } from '@/themes'
import Button, { CreateButton } from '../button'
import FormattedDate from '../formatted-date'
import Columns from '../columns'
import Column from '../column'
import Heading from '../heading'

enum EventStyle {
  StartsToday,
  InbetweenStartAndEnd,
  EndsToday,
}

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    '& .react-calendar__month-view__weekdays abbr': {
      display: 'block',
      textAlign: 'center',
    },
    '& .react-calendar__month-view__days button': {
      minHeight: '5rem',
      border: `1px solid ${theme.palette.divider}`,
    },
    '& button': {
      border: `1px solid ${theme.palette.divider}`,
      '&:hover': {
        cursor: 'pointer',
        background: theme.palette.background.default,
      },
    },
    '& button, & abbr': {
      appearance: 'none',
      outline: 'none',
      font: 'inherit',
      padding: '0.25rem',
      background: 'none',
      color: 'inherit',
      textDecoration: 'none',
      lineHeight: 1,
    },
    '& .react-calendar__navigation': {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '0.5rem',
    },
  },
  tile: {
    textAlign: 'left',
    display: 'flex',
    '& abbr': {
      fontSize: '125%',
      marginRight: '0.25rem',
    },
    '&.react-calendar__tile--active': {
      borderColor: 'rgba(255,255,255,0.5) !important',
    },
  },
  today: {
    borderRadius: '0.25rem',
    outline: '2px solid rgba(255,255,255,0.5) !important',
    zIndex: 100,
  },
}))

const EventLink = styled(Link)`
  font-size: 75%;
  ${({ isBackground }: { isBackground?: boolean }) =>
    isBackground ? `color: ${colorGreyedOut};` : ''}
`

type ValuePiece = Date | null

type Value = ValuePiece | [ValuePiece, ValuePiece]

const EventItem = ({ event, style }: { event: Event; style: EventStyle }) => (
  <EventLink
    to={routes.viewEventWithVar.replace(':eventId', event.slug || event.id)}
    isBackground={event.isbackground}>
    {event.name}
  </EventLink>
)

const Tile = ({ date }: { date: Date }) => {
  const { events } = useContext(EventsContext)
  const classes = useStyles()

  const groupedEvents = events.reduce<{
    [EventStyle.StartsToday]: Event[]
    [EventStyle.InbetweenStartAndEnd]: Event[]
    [EventStyle.EndsToday]: Event[]
  }>(
    (currentValue, event) => {
      if (getIsDateOnSameDay(new Date(event.startsat), date)) {
        return {
          ...currentValue,
          [EventStyle.StartsToday]: currentValue[EventStyle.StartsToday].concat(
            [event]
          ),
        }
      } else if (getIsDateOnSameDay(new Date(event.endsat), date)) {
        return {
          ...currentValue,
          [EventStyle.EndsToday]: currentValue[EventStyle.EndsToday].concat([
            event,
          ]),
        }
      } else if (
        getIsDateInbetweenTwoDates(
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
    <div>
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
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date())
  const [value, setValue] = useState<Value>(new Date())

  return (
    <EventsContext.Provider value={{ events }}>
      <Columns>
        <Column widthPerc={70} padding>
          <Paper>
            <ReactCalendar
              activeStartDate={activeStartDate}
              onActiveStartDateChange={({ activeStartDate }) =>
                setActiveStartDate(activeStartDate!)
              }
              onViewChange={(val) => {}}
              onChange={(newVal) => setValue(newVal)}
              value={value}
              tileContent={Tile}
              className={classes.root}
              tileClassName={({ date }) =>
                `${classes.tile} ${
                  getIsDateOnSameDay(new Date(), date) ? classes.today : ''
                }`
              }
            />
            <br />
            <Button
              size="small"
              color="secondary"
              hollow
              onClick={() => {
                setValue(new Date())
                setActiveStartDate(new Date())
              }}>
              Go To Today
            </Button>
          </Paper>
        </Column>
        {value instanceof Date && (
          <Column widthPerc={30} padding>
            <Paper>
              <Heading variant="h3" noTopMargin>
                {getFormattedDate(value, formatWithoutTime)}
              </Heading>
              <Tile date={value} />
              <CreateButton
                url={routes.createEventWithDateVar.replace(
                  ':date',
                  value.toISOString()
                )}>
                Create Event
              </CreateButton>
            </Paper>
          </Column>
        )}
      </Columns>
    </EventsContext.Provider>
  )
}

export default Calendar
