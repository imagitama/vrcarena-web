import React from 'react'
import WarningIcon from '@material-ui/icons/Warning'
import Message, { MessageProps } from '../message'

export default (props: MessageProps) => (
  <Message icon={<WarningIcon />} color="#332700" {...props} />
)
