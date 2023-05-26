import React from 'react'
import CheckIcon from '@material-ui/icons/Check'
import Message from '../message'

export default ({ children }) => (
  <Message icon={<CheckIcon />} color="#003602">
    {children}
  </Message>
)
