import React from 'react'
import Paper from '@mui/material/Paper'
import CloseIcon from '@mui/icons-material/Close'
import { makeStyles } from '@mui/styles'
import Chariot from '../chariot'
import useNotice from '../../hooks/useNotice'

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
  hideBtn: {
    position: 'absolute',
    padding: '0.5rem',
    top: 0,
    right: 0,
    zIndex: 50,
    '&:hover': {
      cursor: 'pointer',
    },
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
  hideId?: string
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
  hideId,
}: MessageProps) => {
  const [isHidden, hideMessage] = useNotice(hideId)
  const classes = useStyles()

  if (isHidden) {
    return null
  }

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
        {hideId ? (
          <div className={classes.hideBtn} onClick={hideMessage}>
            <CloseIcon />
          </div>
        ) : null}
      </Paper>
    </div>
  )
}
