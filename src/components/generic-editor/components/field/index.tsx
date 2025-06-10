import React from 'react'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Heading from '../../../heading'

export default ({
  label,
  children,
  hint = '',
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) => (
  <FormControl fullWidth style={{ marginBottom: '2rem' }}>
    <Heading variant="h3" noTopMargin>
      {label}
    </Heading>
    {children}
    {hint && <FormHelperText>{hint}</FormHelperText>}
  </FormControl>
)
