import React from 'react'
import ReactTextDiff, { DiffMethod } from 'react-diff-viewer'

const tagsToStringForDiff = (tags: string[]): string => tags.sort().join('\n')

export default ({
  oldTags,
  newTags
}: {
  oldTags: string[]
  newTags: string[]
}) => (
  <ReactTextDiff
    oldValue={tagsToStringForDiff(oldTags)}
    newValue={tagsToStringForDiff(newTags)}
    hideLineNumbers
    compareMethod={DiffMethod.WORDS}
    useDarkTheme
    splitView={false}
    showDiffOnly={false}
    styles={{
      variables: {
        dark: {
          wordRemovedBackground: '',
          wordAddedBackground: ''
        }
      }
    }}
  />
)
