import React from 'react'
import { makeStyles } from '@mui/styles'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

import TagChip from '@/components/tag-chip'

const colorGood = '#83cc83'
const colorBad = '#d57f7f'

const useStyles = makeStyles({
  chip: {
    '&:hover': {
      backgroundColor: 'inherit',
      cursor: 'default',
    },
  },
  removed: {
    '&&': {
      color: colorBad,
      borderColor: `${colorBad} !important`, // TODO: remove !important
    },
  },
  unchanged: {
    // backgroundColor: '#FF0000'
  },
  added: {
    '&&': {
      color: colorGood,
      borderColor: `${colorGood} !important`, // TODO: remove !important
    },
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
