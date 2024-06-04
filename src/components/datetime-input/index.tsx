import React from 'react'
import TextField from '@material-ui/core/TextField'
import moment from 'moment'

const convertIsoStringToLocalDateTime = (isoString: string): string =>
  moment(isoString).format(moment.HTML5_FMT.DATETIME_LOCAL)
const convertLocalDateTimeToIsoString = (localDateTime: string): string =>
  moment(localDateTime).local().toISOString()

const DateTimeInput = ({
  onChange,
  value,
}: {
  value: string
  onChange: (newDate: string) => void
}) => {
  return (
    <TextField
      type="datetime-local"
      defaultValue={convertIsoStringToLocalDateTime(value)}
      variant="outlined"
      InputLabelProps={{
        shrink: true,
      }}
      fullWidth
      onChange={(e) => {
        // NOTE: onChange never fired and value never set if date is invalid
        const newIsoString = convertLocalDateTimeToIsoString(e.target.value)
        console.debug(`DateTimeInput.onChange`, {
          raw: e.target.value,
          final: newIsoString,
        })
        onChange(newIsoString)
      }}
    />
  )
}

export default DateTimeInput
