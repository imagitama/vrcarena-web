import React from 'react'
import WarningIcon from '@material-ui/icons/Warning'
import Message from '../message'

export default ({
  children,
  leftAlign = false,
  noTopMargin = false,
  controls = undefined,
}: {
  children: React.ReactChild | React.ReactChild[]
  leftAlign?: boolean
  noTopMargin?: boolean
  controls?: React.ReactNode
}) => (
  <Message
    icon={<WarningIcon />}
    color="#332700"
    leftAlign={leftAlign}
    noTopMargin={noTopMargin}
    title={children}
    controls={controls}
  />
)
