import React from 'react'
import TagChip from '../tag-chip'
import { tags as officialTagDetails, categories } from '../../utils/tags'

export default ({ tags, shimmer = false, isFilled = true }) => {
  if (shimmer) {
    return (
      <>
        {officialTagDetails
          .filter(tagDetails => tagDetails.category === categories.Features)
          .map(({ tag }) => (
            <TagChip key={tag} tagName={tag} isLoading isFilled={isFilled} />
          ))}
      </>
    )
  }

  if (!tags || !tags.length) {
    return null
  }

  return tags.map(tagName => (
    <TagChip key={tagName} tagName={tagName} isFilled={isFilled} />
  ))
}
