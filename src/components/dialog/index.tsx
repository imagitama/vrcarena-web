import React from 'react'
import MaterialDialog, { DialogProps } from '@mui/material/Dialog'
import CloseIcon from '@mui/icons-material/Close'
import { makeStyles } from '@mui/styles'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

const useStyles = makeStyles({
  contents: {
    width: '50vw',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
    },
  },
  paper: {
    maxWidth: '100%',
    padding: '0.5rem',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
    },
  },
  hideBtn: {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    padding: '0.5rem',
    top: 0,
    right: 0,
    zIndex: 50,
    cursor: 'pointer',
    transition: '100ms all',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
})

interface MyDialogProps extends Omit<DialogProps, 'open'> {}

const Dialog = (props: MyDialogProps) => {
  const classes = useStyles()

  // TODO: Default close button
  return (
    <MaterialDialog
      open
      PaperProps={{
        className: classes.paper,
      }}
      {...props}>
      {props.onClose && (
        <div
          className={classes.hideBtn}
          // @ts-ignore
          onClick={(e) => props.onClose(e, 'closeClick')}>
          <CloseIcon />
        </div>
      )}
      {props.children}
    </MaterialDialog>
  )
}

export default Dialog
