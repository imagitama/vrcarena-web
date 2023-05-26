import React from 'react'
import TextInput from '../../../text-input'

export default ({ onChange, value }) => (
  <TextInput onChange={e => onChange(e.target.value)} value={value} />
)
