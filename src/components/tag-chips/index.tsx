import React from 'react'
import TagChip from '../tag-chip'

export default ({
  tags,
  shimmer = false,
  isFilled = true
}: {
  tags: string[]
  shimmer?: boolean
  isFilled?: boolean
}) => {
  if (shimmer) {
    return (
      <>
        <TagChip tagName="abc" isLoading isFilled={isFilled} />
        <TagChip tagName="def" isLoading isFilled={isFilled} />
        <TagChip tagName="ghi" isLoading isFilled={isFilled} />
      </>
    )
  }

  if (!tags || !tags.length) {
    return null
  }

  return (
    <>
      {tags.map(tagName => (
        <TagChip key={tagName} tagName={tagName} isFilled={isFilled} />
      ))}
    </>
  )
}
