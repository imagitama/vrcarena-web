import React from 'react'
import { makeStyles } from '@mui/styles'
import './skeleton-loading-styles.css'

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
  },
})

export default ({
  width,
  height,
}: {
  width?: number | string
  height?: number | string
}) => {
  const classes = useStyles()
  return (
    <div className={`skeleton-box ${classes.root}`} style={{ width, height }} />
  )
}
