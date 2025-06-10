import React from 'react'
import WarningIcon from '@mui/icons-material/Warning'
import Message, { MessageProps } from '../message'

export default (props: MessageProps) => (
  <Message icon={<WarningIcon />} color="#332700" {...props} />
)
