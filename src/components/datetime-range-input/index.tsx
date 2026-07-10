import React from 'react'
import moment, { Moment } from 'moment'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { MultiSectionDigitalClock } from '@mui/x-date-pickers/MultiSectionDigitalClock'
import { Box } from '@mui/material'
import Columns from '../columns'
import Column from '../column'
import { Separator } from '../event-date-range'

function DateTimeBoundaryInput({
  value,
  onChange,
}: {
  value: string
  onChange: (newVal: string) => void
}) {
  const nativeValue = new Date(value)
  const momentValue = moment(nativeValue)

  const commit = (updated: Moment) => {
    onChange(updated.utc().format('YYYY-MM-DDTHH:mm:ssZ'))
  }

  const handleDateChange = (newDate: Moment | null) => {
    if (!newDate) return
    commit(
      momentValue.clone().set({
        year: newDate.year(),
        month: newDate.month(),
        date: newDate.date(),
      })
    )
  }

  const handleTimeChange = (newTime: Moment | null) => {
    if (!newTime) return
    commit(
      momentValue.clone().set({
        hour: newTime.hour(),
        minute: newTime.minute(),
      })
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <DateCalendar
          value={momentValue}
          onChange={handleDateChange}
          sx={{ width: '100%' }}
        />
        <MultiSectionDigitalClock
          value={momentValue}
          onChange={handleTimeChange}
        />
      </Box>
    </LocalizationProvider>
  )
}

function DateTimeRangeInput({
  startsAtValue,
  endsAtValue,
  onChange,
}: {
  startsAtValue: string
  endsAtValue: string
  onChange: (newStartsAtVal: string, newEndsAtValue: string) => void
}) {
  return (
    <Columns>
      <Column widthPerc={45}>
        <DateTimeBoundaryInput
          value={startsAtValue}
          onChange={(newVal) => {
            onChange(newVal, endsAtValue)
          }}
        />
      </Column>
      <Column widthPerc={10}>
        <Separator>
          <ArrowForwardIcon />
        </Separator>
      </Column>
      <Column widthPerc={45}>
        <DateTimeBoundaryInput
          value={endsAtValue}
          onChange={(newVal) => {
            onChange(startsAtValue, newVal)
          }}
        />
      </Column>
    </Columns>
  )
}

export default DateTimeRangeInput
