import React from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

export default ({ onChange, label, value }) => (
  <FormControlLabel
    label={label}
    control={<Checkbox onChange={() => onChange(!value)} checked={value} />}
  />
)
