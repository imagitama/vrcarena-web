import React from 'react'
import TextInput from '../../../text-input'

export default ({ onChange, value, multiline }) => (
  <TextInput
    onChange={(e) => onChange(e.target.value)}
    value={value}
    multiline={multiline === true}
    minRows={multiline ? 3 : 0}
    fullWidth
  />
)
