import React from 'react'
import Chip from '@material-ui/core/Chip'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { makeStyles } from '@material-ui/core/styles'
import tags, { getLabelForTagDetails, TagDetails } from '../../utils/tags'

const useStyles = makeStyles({
  icon: {
    '& svg': {
      width: '1em',
      color: 'inherit',
      fill: 'inherit'
    }
  },
  row: {},
  features: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  feature: {
    margin: '0.25rem'
  },
  label: {
    width: '3rem'
  }
})

const FeatureChip = ({
  tagDetails,
  isSelected
}: {
  tagDetails: TagDetails
  isSelected: boolean
}) => {
  const classes = useStyles()
  const Icon = tagDetails.icon || null
  return (
    <div className={classes.feature}>
      <Chip
        size="medium"
        label={getLabelForTagDetails(tagDetails)}
        icon={
          Icon ? (
            <div className={classes.icon}>
              <Icon />
            </div>
          ) : (
            undefined
          )
        }
        onDelete={() => {}}
        deleteIcon={
          isSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />
        }
      />
    </div>
  )
}

const FeaturesToTagsEditor = ({
  currentTags = [],
  category,
  onChange
}: {
  currentTags?: string[]
  category?: string
  onChange: (newTags: string[]) => void
}) => {
  const classes = useStyles()
  return (
    <div>
      {Object.entries(
        tags.reduce<{ [categoryName: string]: TagDetails[] }>(
          (tagsByCategory, tagDetails) => ({
            ...tagsByCategory,
            [tagDetails.category]:
              tagDetails.category in tagsByCategory
                ? tagsByCategory[tagDetails.category].concat([tagDetails])
                : [tagDetails]
          }),
          {}
        )
      ).map(([categoryName, tagDetailItems]) => (
        <div className={classes.row}>
          <div className={classes.label}>{categoryName}</div>
          <div className={classes.features}>
            {tagDetailItems.map(tagDetails => (
              <FeatureChip
                key={tagDetails.tag}
                tagDetails={tagDetails}
                isSelected={currentTags.includes(tagDetails.tag)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default FeaturesToTagsEditor
