import React from 'react'
import { makeStyles } from '@mui/styles'
import Chariot from '../chariot'

const useStyles = makeStyles({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    height: '1em',
  },
  icon: {
    width: '2em',
    height: '2em',
  },
  label: {
    paddingLeft: '0.25rem',
  },
})

const MiniLoadingIndicator = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return (
    <span className={classes.root}>
      <span className={classes.icon}>
        <Chariot spin />
      </span>
      <span className={classes.label}>{children}</span>
    </span>
  )
}

export default MiniLoadingIndicator
