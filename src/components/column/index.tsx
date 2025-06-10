import React from 'react'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  columns: {
    display: 'flex',
  },
  withPadding: {
    padding: '0.5rem',
  },
  column: {},
})

const Column = ({
  children,
  width = 50,
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
      style={{ width: `${width}%` }}>
      {children}
    </div>
  )
}

export default Column
