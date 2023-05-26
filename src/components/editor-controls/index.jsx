import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    textAlign: 'center',
    marginTop: '1rem'
  }
}))

export default ({ children }) => {
  const classes = useStyles()
  return <div className={classes.root}>{children}</div>
}
