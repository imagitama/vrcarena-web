import React from 'react'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@mui/styles'
import Chariot from '../chariot'

const useStyles = makeStyles(() => ({
  root: {
    margin: '1rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftAlign: {
    justifyContent: 'flex-start',
  },
  paper: {
    position: 'relative',
    padding: '1rem',
    width: '100%',
    maxWidth: '750px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    width: '100%',
    zIndex: 10,
  },
  icon: {
    height: '100%',
    // alignSelf: 'baseline', TODO: Why this
    marginRight: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  chariot: {
    position: 'absolute',
    top: 0,
    right: 0,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    zIndex: 1,
    '& svg': {
      width: 'auto',
      height: '150%',
      position: 'absolute',
      top: '-25%',
      right: '2.5%',
      opacity: 0.05,
    },
  },
  title: {
    fontSize: '125%',
    fontWeight: 100,
    // display: 'flex', TODO: Why was this on? Breaks links in titles
    alignItems: 'center',
    position: 'relative',
    zIndex: 50,
  },
  children: {
    marginTop: '0.25rem',
    '& p:first-child': {
      marginTop: 0,
    },
  },
  controls: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    '& > *': {
      margin: '0 0.25rem',
    },
  },
  // at end to override
  noMargin: {
    margin: 0,
  },
  noTopMargin: {
    marginTop: 0,
  },
}))

export interface MessageProps {
  children?: React.ReactNode
  title?: React.ReactNode
  icon?: React.ReactNode
  controls?: React.ReactNode
  color?: string
  leftAlign?: boolean
  noMargin?: boolean
  noTopMargin?: boolean
  paperClassName?: string
  className?: string
}

export default ({
  title,
  children,
  icon,
  controls,
  color = '',
  leftAlign = false,
  noMargin = false,
  noTopMargin = false,
  paperClassName = undefined,
  className,
}: MessageProps) => {
  const classes = useStyles()

  return (
    <div
      className={`${classes.root} ${leftAlign ? classes.leftAlign : ''} ${
        noMargin ? classes.noMargin : ''
      } ${noTopMargin ? classes.noTopMargin : ''} ${className}`}>
      <Paper
        className={`${classes.paper} ${paperClassName}`}
        style={{ backgroundColor: color }}>
        <div className={classes.chariot}>
          <Chariot />
        </div>
        {icon && <div className={classes.icon}>{icon}</div>}
        <div className={classes.text}>
          {title && <div className={classes.title}>{title}</div>}
          {children && (
            <div
              className={`${classes.children} ${
                title ? '' : classes.noTopMargin
              }`}>
              {children}
            </div>
          )}
          {controls && <div className={classes.controls}>{controls}</div>}
        </div>
      </Paper>
    </div>
  )
}
