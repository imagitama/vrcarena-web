import React from 'react'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import { makeStyles } from '@mui/styles'

import useDataStoreItems from '../../hooks/useDataStoreItems'
import { CollectionNames, Tag } from '../../modules/tags'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import Heading from '../heading'

const useStyles = makeStyles({
  featureEditors: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '1rem',
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      width: '50%',
      marginBottom: '1rem !important',
      '&:last-child': {
        marginBottom: 0,
      },
    },
  },
  doesNotHave: {
    opacity: '0.5',
  },
  item: {
    fontSize: '75%',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: '0.5rem',
    },
    margin: '0 0.5rem 0.5rem 0',
  },
})

const FeatureEditor = ({
  tagData,
  selectedTagName,
  onSelectTagName,
}: {
  tagData: Tag
  selectedTagName: string | null
  onSelectTagName: (newTagName: string | null) => void
}) => {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">{tagData.description}</FormLabel>
      <RadioGroup
        value={selectedTagName}
        row
        onChange={(e) => onSelectTagName(e.target.value)}>
        <FormControlLabel
          value={tagData.id}
          control={<Radio />}
          label={tagData.label || tagData.id}
        />
        {tagData.oppositetag ? (
          <FormControlLabel
            value={tagData.oppositetag}
            control={<Radio />}
            label={tagData.oppositetag}
          />
        ) : null}
        <FormControlLabel
          value={null}
          control={<Radio />}
          label="(do not set)"
          className="disabled"
        />
      </RadioGroup>
    </FormControl>
  )
}

const useTags = () =>
  useDataStoreItems<Tag>(CollectionNames.Tags, undefined, {
    queryName: 'tags-for-features',
  })

const FeaturesSubEditor = ({
  currentTags,
  onChange,
}: {
  currentTags: string[]
  onChange: (currentTags: string[]) => void
}) => {
  const [isLoadingFeatures, lastErrorCodeLoadingFeatures, tags] = useTags()
  const classes = useStyles()

  if (isLoadingFeatures || !tags) {
    return <LoadingIndicator message="Loading features..." />
  }

  if (lastErrorCodeLoadingFeatures !== null) {
    return (
      <ErrorMessage>
        Failed to load features (code {lastErrorCodeLoadingFeatures})
      </ErrorMessage>
    )
  }

  const tagDataByCategory = tags.reduce<{ [categoryName: string]: Tag[] }>(
    (result, tagData) => ({
      ...result,
      [tagData.category]: result[tagData.category]
        ? result[tagData.category].concat([tagData])
        : [tagData],
    }),
    {}
  )

  const onSelectTagName = (tagData: Tag, newTagName: string | null) => {
    onChange(
      newTagName
        ? currentTags.concat([newTagName])
        : currentTags.filter(
            (tag) => tag !== tagData.id && tag !== tagData.oppositetag
          )
    )
  }

  return (
    <>
      {Object.entries(tagDataByCategory).map(
        ([categoryName, tagDatas], index) => (
          <>
            <Heading variant="h2" noTopMargin={index === 0}>
              {categoryName}
            </Heading>
            <div className={classes.featureEditors}>
              {tagDatas.map((tagData) => {
                const selectedTagName = currentTags.includes(tagData.id)
                  ? tagData.id
                  : tagData.oppositetag &&
                    currentTags.includes(tagData.oppositetag)
                  ? tagData.oppositetag
                  : null

                const hasFeature = currentTags.includes(tagData.id)
                const hasOpposite =
                  tagData.oppositetag &&
                  currentTags.includes(tagData.oppositetag)

                return (
                  <FeatureEditor
                    key={tagData.id}
                    tagData={tagData}
                    selectedTagName={selectedTagName}
                    onSelectTagName={(newTagName) =>
                      onSelectTagName(tagData, newTagName)
                    }
                  />
                )
              })}
            </div>
          </>
        )
      )}
    </>
  )
}

export default FeaturesSubEditor
