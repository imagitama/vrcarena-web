import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
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
  noMargin: {
    margin: 0,
  },
  noTopMargin: {
    marginTop: 0,
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
    '& > *': {
      margin: '1rem 0',
      '&:first-child': {
        marginTop: 0,
      },
      '&:last-child': {
        marginBottom: 0,
      },
    },
  },
  icon: {
    marginRight: '1rem',
    display: 'flex',
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
    display: 'flex',
    alignItems: 'center',
  },
  children: {},
  controls: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    '& > *': {
      margin: '0 0.25rem',
    },
  },
}))

export default ({
  title,
  children,
  icon,
  controls,
  color = '',
  leftAlign = false,
  noMargin = false,
  noTopMargin = false,
}: {
  children?: React.ReactNode
  title?: React.ReactNode
  icon?: React.ReactNode
  controls?: React.ReactNode
  color?: string
  leftAlign?: boolean
  noMargin?: boolean
  noTopMargin?: boolean
}) => {
  const classes = useStyles()

  return (
    <div
      className={`${classes.root} ${leftAlign ? classes.leftAlign : ''} ${
        noMargin ? classes.noMargin : ''
      } ${noTopMargin ? classes.noTopMargin : ''}`}>
      <Paper className={classes.paper} style={{ backgroundColor: color }}>
        <div className={classes.chariot}>
          <Chariot />
        </div>
        <div className={`${classes.text}`}>
          {title || icon ? (
            <div className={classes.title}>
              {' '}
              {icon ? <div className={classes.icon}>{icon}</div> : null}{' '}
              <span>{title}</span>
            </div>
          ) : null}
          {children ? <div className={classes.children}>{children}</div> : null}
          {controls ? <div className={classes.controls}>{controls}</div> : null}
        </div>
      </Paper>
    </div>
  )
}
