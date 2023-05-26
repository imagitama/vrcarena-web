import React from 'react'
import TagInput from '../../../tag-input'

export default ({ onChange, value }) => (
  <TagInput onChange={newTags => onChange(newTags)} currentTags={value} />
)
