import React from 'react'
import Chip, { ChipProps } from '@material-ui/core/Chip'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  iconOnly: {
    width: '32px',
    '& svg': {
      margin: 0
    },
    '& span': {
      padding: 0
    }
  }
})

export default (chipProps: ChipProps) => {
  const classes = useStyles()
  return (
    <Chip
      {...chipProps}
      className={`${chipProps.className || ''} ${
        chipProps.label === false ? classes.iconOnly : ''
      }`}
    />
  )
}
