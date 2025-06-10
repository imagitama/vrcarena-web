import React from 'react'
import { makeStyles } from '@mui/styles'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import TagChip from '../tag-chip'

const useStyles = makeStyles({
  chip: {
    '&:hover': {
      backgroundColor: 'inherit',
      cursor: 'default',
    },
  },
  removed: {
    backgroundColor: 'rgb(100, 50, 50)',
  },
  unchanged: {
    // backgroundColor: '#FF0000'
  },
  added: {
    backgroundColor: 'rgb(50, 100, 50)',
  },
})

const TagDiffChips = ({
  oldTags,
  newTags,
}: {
  oldTags: string[]
  newTags: string[]
}) => {
  const classes = useStyles()

  const addedTags = newTags.filter((tag) => !oldTags.includes(tag))
  const removedTags = oldTags.filter((tag) => !newTags.includes(tag))
  const unchangedTags = newTags.filter((tag) => oldTags.includes(tag))

  return (
    <div>
      {addedTags.map((tag) => (
        <TagChip
          key={tag}
          tagName={tag}
          className={`${classes.chip} ${classes.added}`}
          icon={<AddIcon />}
          noLink
        />
      ))}
      {unchangedTags.map((tag) => (
        <TagChip
          key={tag}
          tagName={tag}
          className={`${classes.chip} ${classes.unchanged}`}
          noLink
        />
      ))}
      {removedTags.map((tag) => (
        <TagChip
          key={tag}
          tagName={tag}
          className={`${classes.chip} ${classes.removed}`}
          icon={<RemoveIcon />}
          noLink
        />
      ))}
    </div>
  )
}

export default TagDiffChips
