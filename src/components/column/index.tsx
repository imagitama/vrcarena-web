import React from 'react'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  withPadding: {
    padding: '0.5rem',
  },
})

const Column = ({
  children,
  widthPerc: overrideWidthPerc,
  padding = false,
}: {
  children: React.ReactNode
  widthPerc?: number
  padding?: boolean
}) => {
  const classes = useStyles()
  return (
    <div
      className={`${padding ? classes.withPadding : ''}`}
      style={
        overrideWidthPerc
          ? { width: `${overrideWidthPerc}%`, flex: 'auto' }
          : {}
      }>
      {children}
    </div>
  )
}

export default Column
