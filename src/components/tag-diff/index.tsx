import React from 'react'
import ReactTextDiff, { DiffMethod } from 'react-diff-viewer'
import TagDiffChips from '../tag-diff-chips'

const tagsToStringForDiff = (tags: string[]): string => tags.sort().join('\n')

export enum TagDiffMode {
  Text = 'text',
  Chips = 'chips',
}

const TagDiff = ({
  oldTags,
  newTags,
  mode = TagDiffMode.Text,
}: {
  oldTags: string[]
  newTags: string[]
  mode?: TagDiffMode
}) =>
  mode === TagDiffMode.Chips ? (
    <TagDiffChips oldTags={oldTags} newTags={newTags} />
  ) : (
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
            wordAddedBackground: '',
          },
        },
      }}
    />
  )

export default TagDiff
