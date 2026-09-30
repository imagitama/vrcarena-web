import React from 'react'
import DateFormatToggle from '../date-format-toggle'
import useIsDateFormatUS from '@/hooks/useIsDateFormatUS'
import Button from '../button'

const { default: moment } = await import('moment')
const LazyDateTimePicker = React.lazy(() => import('./lazy'))

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
      <LazyDateTimePicker
        value={moment(value)}
        onChange={(newVal) => onChange(newVal!.utc().toISOString())}
        format={`${isDateFormatUS ? 'MM/DD' : 'DD/MM'}/YYYY hh:mm A`}
      />
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
