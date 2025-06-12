import React from 'react'
import TagInput from '../../../tag-input'

export default ({
  onChange,
  value,
}: {
  value: string[]
  onChange: (newTags: string[]) => void
}) => (
  <TagInput
    onChange={(newTags) => onChange(newTags)}
    currentTags={value}
    // for species tags
    showRecommendedTags={false}
    showChatGptSuggestions={false}
    autoComplete={false}
  />
)
