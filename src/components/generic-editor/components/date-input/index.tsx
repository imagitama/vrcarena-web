import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import DateTimeInput from '../../../datetime-input'
import FormattedDate from '../../../formatted-date'

const useStyles = makeStyles({
  preview: {
    padding: '0.5rem 0 0.5rem',
  },
})

const DateInput = ({
  value,
  onChange,
}: {
  value: string
  onChange: (newValue: string) => void
}) => {
  const classes = useStyles()
  return (
    <div>
      <DateTimeInput value={value} onChange={onChange} />{' '}
      <div className={classes.preview}>
        {value ? (
          <>
            <FormattedDate date={new Date(value)} isRelative={false} /> (
            <FormattedDate date={new Date(value)} isRelative={true} />)
          </>
        ) : (
          '(no date entered)'
        )}
      </div>
    </div>
  )
}

export default DateInput
