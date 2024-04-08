import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    border: '2px dashed rgba(255, 255, 0, 0.5)',
    padding: '0.5rem',
  },
}))

const EditorBox = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const classes = useStyles()
  return <div className={`${classes.root} ${className || ''}`}>{children}</div>
}

export default EditorBox
