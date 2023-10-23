import React, { useState, useEffect } from 'react'
import { WithOutContext as ReactTags } from 'react-tag-input-no-dnd'

import { areasByCategory } from '../../areas'
import categoryMeta from '../../category-meta'
import { renamedTags } from '../../utils/tags'

import './styles.css'

const mapTagStringToReactTagInputTag = tagString => ({
  id: tagString,
  text: tagString
})

const keyCodes = {
  ENTER: 13,
  TAB: 9,
  SPACE: 32,
  COMMA: 188
}

const getActualAutocompleteTagName = tagName => {
  for (const [goodTag, badTags] of Object.entries(renamedTags)) {
    if (badTags.includes(tagName)) {
      return goodTag
    }
  }
  return tagName
}

const getActualAutocompleteText = (tagName, intendedText) => {
  for (const [goodTag, badTags] of Object.entries(renamedTags)) {
    if (badTags.includes(tagName)) {
      return `${tagName} => ${goodTag}`
    }
  }
  return intendedText
}

const areaSuggestions = Object.entries(areasByCategory).reduce(
  (finalTags, [categoryName, areas]) =>
    finalTags.concat(
      Object.values(areas).reduce(
        (tags, area) =>
          tags.concat(
            area.tags.map(tagName => ({
              id: getActualAutocompleteTagName(tagName),
              text: getActualAutocompleteText(
                tagName,
                `${categoryMeta[categoryName].name}/${
                  area.namePlural
                } - ${tagName}`
              )
            }))
          ),
        []
      )
    ),
  []
)

// const popularSuggestions = officialTagDetails.map(({ tag, category }) => ({
//   id: tag,
//   text: `${category} - ${tag}`
// }))

const renamedSuggestions = Object.entries(renamedTags).reduce(
  (finalTags, [goodTag, badTags]) =>
    finalTags.concat([
      { id: goodTag, text: `${badTags.join('|')} => ${goodTag}` }
    ]),
  []
)

const suggestions = []
  .concat(areaSuggestions)
  // .concat(popularSuggestions)
  .concat(renamedSuggestions)

export default ({ currentTags = [], onChange, className = '' }) => {
  const [newTags, setNewTags] = useState(currentTags || [])

  useEffect(() => {
    if (currentTags) {
      setNewTags(currentTags)
    }
  }, [currentTags ? currentTags.join('+') : null])

  const removeTag = index => {
    const newVal = [...newTags]
    newVal.splice(index, 1)

    setNewTags(newVal)

    onChange && onChange(newVal)
  }

  const addTag = item => {
    const newVal = newTags.concat([item.id])

    setNewTags(newVal)

    onChange && onChange(newVal)
  }

  return (
    <div className={className}>
      <ReactTags
        tags={newTags.map(mapTagStringToReactTagInputTag)}
        suggestions={suggestions}
        handleDelete={removeTag}
        handleAddition={addTag}
        allowDragDrop={false}
        delimiters={[
          keyCodes.TAB,
          keyCodes.SPACE,
          keyCodes.COMMA,
          keyCodes.ENTER
        ]}
        placeholder="Type a tag and press enter"
      />
    </div>
  )
}
