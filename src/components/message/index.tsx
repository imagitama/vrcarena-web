import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    margin: '1rem 0',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center'
  },
  noMargin: {
    margin: 0
  },
  noTopMargin: {
    marginTop: 0
  },
  text: {
    width: '100%'
  },
  icon: {
    marginRight: '1rem',
    display: 'flex'
  },
  leftAlign: {
    textAlign: 'left'
  }
}))

export default ({
  children,
  icon,
  color = '',
  leftAlign = false,
  noMargin = false,
  noTopMargin = false
}: {
  children: React.ReactNode
  icon?: React.ReactNode
  color?: string
  leftAlign?: boolean
  noMargin?: boolean
  noTopMargin?: boolean
}) => {
  const classes = useStyles()

  return (
    <Paper
      className={`${classes.root} ${noMargin ? classes.noMargin : ''} ${
        noTopMargin ? classes.noTopMargin : ''
      }`}
      style={{ backgroundColor: color }}>
      {icon ? <div className={classes.icon}>{icon}</div> : null}
      <div className={`${classes.text} ${leftAlign ? classes.leftAlign : ''}`}>
        {children}
      </div>
    </Paper>
  )
}
