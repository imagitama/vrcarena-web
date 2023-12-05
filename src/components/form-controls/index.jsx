import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    textAlign: 'center',
    margin: '0.5rem 0',
  },
  extraTopMargin: {
    marginTop: '2rem',
  },
})

export default ({ children, className = '', extraTopMargin = false }) => {
  const classes = useStyles()
  return (
    <div
      className={`${classes.root} ${className} ${
        extraTopMargin ? classes.extraTopMargin : ''
      }`}>
      {children}
    </div>
  )
}
