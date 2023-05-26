import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    textAlign: 'center',
    marginTop: '0.5rem'
  }
})

export default ({ children, className = '' }) => {
  const classes = useStyles()
  return <div className={`${classes.root} ${className}`}>{children}</div>
}
