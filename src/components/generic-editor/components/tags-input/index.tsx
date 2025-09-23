import React from 'react'
import TagInput, { TagInputSettings } from '../../../tag-input'

export default ({
  onChange,
  value,
  ...props
}: {
  value: string[]
  onChange: (newTags: string[]) => void
} & TagInputSettings) => (
  <TagInput
    onChange={(newTags) => onChange(newTags)}
    currentTags={value}
    {...props}
  />
)
