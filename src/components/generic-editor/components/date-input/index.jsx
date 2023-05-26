import React from 'react'
import TextField from '@material-ui/core/TextField'
import moment from 'moment'

const convertIsoStringToLocalDateTime = isoString =>
  moment(isoString).format(moment.HTML5_FMT.DATETIME_LOCAL)
const convertLocalDateTimeToIsoString = localDateTime =>
  moment(localDateTime)
    .local()
    .toISOString()

export default ({ onChange, value }) => (
  <TextField
    type="datetime-local"
    // defaultValue="2017-05-24T10:30"
    value={convertIsoStringToLocalDateTime(value)}
    variant="outlined"
    InputLabelProps={{
      shrink: true
    }}
    onChange={e => {
      const isoString = convertLocalDateTimeToIsoString(e.target.value)
      onChange(isoString)
    }}
  />
)
