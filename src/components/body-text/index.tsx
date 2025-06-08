import React from 'react'
import Typography from '@material-ui/core/Typography'

export default ({ children }: { children: React.ReactNode }) => (
  <Typography component="p" variant="body1">
    {children}
  </Typography>
)
