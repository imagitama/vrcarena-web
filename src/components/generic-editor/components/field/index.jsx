import React from 'react'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'

export default ({ label, hint = '', children }) => (
  <FormControl fullWidth style={{ marginBottom: '2rem' }}>
    {label}
    <br />
    {children}
    {hint && <FormHelperText>{hint}</FormHelperText>}
  </FormControl>
)
