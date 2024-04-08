import React from 'react'
import ReactTextDiff, { DiffMethod } from 'react-diff-viewer'

const TextDiff = ({
  oldValue,
  newValue,
}: {
  oldValue: string
  newValue: string
}) => {
  const isSingleLine = !oldValue.includes('\n') && !newValue.includes('\n')

  return (
    <ReactTextDiff
      oldValue={oldValue || ''} // handle weird case when not strings
      newValue={newValue || ''} // handle weird case when not strings
      hideLineNumbers
      compareMethod={isSingleLine ? DiffMethod.CHARS : DiffMethod.WORDS}
      useDarkTheme
      // need this enabled otherwise single-line diffs don't render anything
      showDiffOnly={false}
    />
  )
}

export default TextDiff
