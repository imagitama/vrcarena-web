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

const Columns = ({
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

export default Columns
