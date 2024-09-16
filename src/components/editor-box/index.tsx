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
  show = true,
}: {
  children: React.ReactNode
  className?: string
  show?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={`${show ? classes.root : ''} ${className || ''}`}>
      {children}
    </div>
  )
}

export default EditorBox
