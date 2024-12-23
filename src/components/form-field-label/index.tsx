import React, { Fragment, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    // copied from material ui input
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
  },
})

const FormFieldLabel = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <span className={classes.root}>{children}</span>
}

export default FormFieldLabel
