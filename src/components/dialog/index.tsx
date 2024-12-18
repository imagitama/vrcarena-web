import React from 'react'
import MaterialDialog, { DialogProps } from '@material-ui/core/Dialog'
import { makeStyles } from '@material-ui/core/styles'
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
      {...props}
    />
  )
}

export default Dialog
