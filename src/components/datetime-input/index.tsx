import React from 'react'
import moment from 'moment'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import DateFormatToggle from '../date-format-toggle'
import useIsDateFormatUS from '@/hooks/useIsDateFormatUS'
import Button from '../button'

const DateTimeInput = ({
  onChange,
  value,
}: {
  value: string | undefined
  onChange: (newDate: string) => void
}) => {
  const [isDateFormatUS] = useIsDateFormatUS()
  return (
    <>
      <DateFormatToggle />
      <br />
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DateTimePicker
          value={moment(value)}
          onChange={(newVal) => onChange(newVal!.utc().toISOString())}
          format={`${isDateFormatUS ? 'MM/DD' : 'DD/MM'}/YYYY hh:mm A`}
        />
      </LocalizationProvider>{' '}
      <Button
        onClick={() => onChange(new Date().toISOString())}
        color="secondary"
        hollow>
        Now
      </Button>{' '}
      {value && (
        <Button
          onClick={() => {
            const date = new Date(value)
            const newVal = new Date(date)
            newVal.setHours(newVal.getHours() + 1)
            onChange(newVal.toISOString())
          }}
          color="secondary"
          hollow>
          +1 Hour
        </Button>
      )}{' '}
      {value && (
        <Button
          onClick={() => {
            const date = new Date(value)
            const newVal = new Date(date)
            newVal.setDate(newVal.getDate() + 1)
            onChange(newVal.toISOString())
          }}
          color="secondary"
          hollow>
          +1 Day
        </Button>
      )}
    </>
  )
}

export default DateTimeInput
