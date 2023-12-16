import React from 'react'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import Heading from '../../../heading'

export default ({ label, hint = '', children }) => (
  <FormControl fullWidth style={{ marginBottom: '2rem' }}>
    <Heading variant="h3" noTopMargin>
      {label}
    </Heading>
    {children}
    {hint && <FormHelperText>{hint}</FormHelperText>}
  </FormControl>
)
