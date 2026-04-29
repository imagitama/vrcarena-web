import React from 'react'
import { makeStyles } from '@mui/styles'
import { mediaQueryForMobiles } from '@/media-queries'

const useStyles = makeStyles({
  column: {
    width: '50%',
    [mediaQueryForMobiles]: {
      width: '100%',
    },
  },
  withPadding: {
    padding: '0.5rem',
  },
})

const Column = ({
  children,
  width: overrideWidth,
  padding = false,
}: {
  children: React.ReactNode
  width?: number
  padding?: boolean
}) => {
  const classes = useStyles()
  return (
    <div
      className={`${classes.column} ${padding ? classes.withPadding : ''}`}
      style={overrideWidth ? { width: `${overrideWidth}%` } : {}}>
      {children}
    </div>
  )
}

export default Column
