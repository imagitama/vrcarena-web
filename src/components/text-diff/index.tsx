import React from 'react'
import ReactTextDiff, { DiffMethod } from 'react-diff-viewer'

export default ({
  oldValue,
  newValue
}: {
  oldValue: string
  newValue: string
}) => (
  <ReactTextDiff
    oldValue={oldValue || ''} // handle weird case when not strings
    newValue={newValue || ''} // handle weird case when not strings
    hideLineNumbers
    compareMethod={DiffMethod.WORDS}
    useDarkTheme
  />
)
