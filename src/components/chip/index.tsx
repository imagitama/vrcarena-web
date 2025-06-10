import React from 'react'
import MaterialChip, { ChipProps } from '@mui/material/Chip'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  iconOnly: {
    width: '32px',
    '& svg': {
      margin: 0,
    },
    '& span': {
      padding: 0,
    },
  },
})

const Chip = (props: ChipProps) => {
  const classes = useStyles()
  return (
    <MaterialChip
      {...props}
      className={`${props.className || ''} ${
        props.label === false ? classes.iconOnly : ''
      }`}
    />
  )
}

export default Chip
