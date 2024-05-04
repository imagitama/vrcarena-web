import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import categoryMeta from '../../category-meta'
import Heading from '../heading'
import CategoryItem from '../category-item'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
})

export default ({ onSelect, title = '' }) => {
  const classes = useStyles()
  const [highlightedItemName, setHighlightedItemName] = useState(null)

  const onClick = (name) => {
    if (highlightedItemName) {
      return
    }

    setHighlightedItemName(name)

    setTimeout(() => {
      onSelect(name)
    }, 400)
  }

  return (
    <>
      <Heading variant="h1">Upload {title ? `"${title}"` : 'Asset'}</Heading>
      <Heading variant="h2">Select a category</Heading>
      <div className={classes.root}>
        {Object.entries(categoryMeta).map(([name, meta]) => (
          <CategoryItem
            key={name}
            category={meta}
            isSelected={highlightedItemName === name}
            onClick={() => onClick(name)}
          />
        ))}
      </div>
    </>
  )
}
