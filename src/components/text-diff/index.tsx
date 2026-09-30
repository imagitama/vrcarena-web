import React from 'react'
import type { DiffMethod } from 'react-diff-viewer-continued'

const ReactTextDiff = React.lazy(() => import('react-diff-viewer-continued'))

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
      compareMethod={
        isSingleLine ? ('diffChars' as DiffMethod) : ('diffWords' as DiffMethod)
      }
      useDarkTheme
      // need this enabled otherwise single-line diffs don't render anything
      showDiffOnly={false}
    />
  )
}

export default TextDiff
