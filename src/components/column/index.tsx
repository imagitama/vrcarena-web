import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  columns: {
    display: 'flex',
  },
  withPadding: {
    padding: '0.5rem',
  },
  column: {},
})

export const Column = ({
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

export const Columns = ({
  children,
  padding = false,
}: {
  children: React.ReactNode
  padding?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={`${classes.columns} ${padding ? classes.withPadding : ''}`}>
      {children}
    </div>
  )
}

export default () => {
  throw new Error('Import named export Column, Columns')
}
