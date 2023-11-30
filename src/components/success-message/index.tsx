import React from 'react'
import CheckIcon from '@material-ui/icons/Check'
import Message from '../message'

export default ({
  children,
  controls,
}: {
  children: React.ReactNode
  controls?: React.ReactNode
}) => (
  <Message
    icon={<CheckIcon />}
    color="#003602"
    title={children}
    controls={controls}
  />
)
