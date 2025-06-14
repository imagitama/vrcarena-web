import React from 'react'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  root: {
    marginBottom: '0.5rem',
  },
})

export default ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.root}>{children}</div>
}
