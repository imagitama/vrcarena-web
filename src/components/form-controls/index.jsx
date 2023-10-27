import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    textAlign: 'center',
    margin: '0.5rem 0'
  }
})

export default ({ children, className = '' }) => {
  const classes = useStyles()
  return <div className={`${classes.root} ${className}`}>{children}</div>
}
