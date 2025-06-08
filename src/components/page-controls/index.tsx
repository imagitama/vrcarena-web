import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    marginTop: '3rem',
    textAlign: 'center',
  },
})

export default ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.root}>{children}</div>
}
