import React from 'react'
import CheckIcon from '@material-ui/icons/Check'
import Message, { MessageProps } from '../message'

export default (props: MessageProps) => (
  <Message icon={<CheckIcon />} color="#003602" {...props} />
)
