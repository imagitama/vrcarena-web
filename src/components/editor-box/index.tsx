import React from 'react'
import { makeStyles } from '@mui/styles'
import Heading from '../heading'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    border: '1px dashed rgba(255, 255, 0, 0.5)',
    padding: '0.5rem',
  },
}))

const EditorBox = ({
  title,
  children,
  className,
  show = true,
}: {
  title?: string
  children: React.ReactNode
  className?: string
  show?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={`${show ? classes.root : ''} ${className || ''}`}>
      {title && (
        <Heading variant="h4" noTopMargin>
          {title}
        </Heading>
      )}
      {children}
    </div>
  )
}

export default EditorBox
