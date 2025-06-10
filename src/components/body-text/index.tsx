import React from 'react'
import Typography from '@mui/material/Typography'

const BodyText = ({ children }: { children: React.ReactNode }) => (
  <Typography component="p" variant="body1">
    {children}
  </Typography>
)

export default BodyText
