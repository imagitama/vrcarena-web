import React, { ImgHTMLAttributes } from 'react'
import { makeStyles } from '@mui/styles'
import Tooltip from '../tooltip'
import { VRCArenaTheme } from '../../themes'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    display: 'flex',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
}))

const Image = (props: ImgHTMLAttributes<HTMLImageElement>) => {
  const classes = useStyles()
  const content = (
    <span className={classes.root}>
      <img {...props} />
    </span>
  )

  if (props.title) {
    return <Tooltip title={props.title}>{content}</Tooltip>
  }

  return content
}

export default Image
