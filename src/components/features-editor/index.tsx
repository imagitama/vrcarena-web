import React, { useEffect, useState } from 'react'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import HelpIcon from '@material-ui/icons/Help'
import SaveIcon from '@material-ui/icons/Save'

import useDataStoreItems from '../../hooks/useDataStoreItems'
import { CollectionNames, Tag } from '../../modules/tags'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import Heading from '../heading'
import Paper from '../paper'
import { CollectionNames as AssetsCollectionNames } from '../../modules/assets'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import Button from '../button'
import { handleError } from '../../error-handling'

const useStyles = makeStyles({
  featureEditors: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      width: '50%',
      marginBottom: '0.5rem',
    },
  },
  doesNotHave: {
    opacity: '0.5',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: '0.5rem',
    },
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

const FeaturesEditor = ({
  assetId,
  currentTags,
  onDone,
  isEditing,
}: {
  currentTags: string[]
  assetId?: string
  onDone?: () => void
  isEditing?: boolean
}) => {
  const [isLoadingFeatures, isErrorLoadingFeatures, tags] = useTags()
  const classes = useStyles()
  const [newTags, setNewTags] = useState(currentTags)
  const [isSaving, , isSaveError, save] = useDatabaseSave(
    AssetsCollectionNames.Assets,
    assetId || null
  )

  useEffect(() => {
    setNewTags(currentTags)
  }, [currentTags.length])

  if (isSaving) {
    return <LoadingIndicator message="Saving features for asset..." />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save features for asset</ErrorMessage>
  }

  if (isLoadingFeatures || !tags) {
    return <LoadingIndicator message="Loading features..." />
  }

  if (isErrorLoadingFeatures) {
    return <ErrorMessage>Failed to load features</ErrorMessage>
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
    console.debug(`select tag name`, newTagName, tagData)
    setNewTags((newTags) =>
      newTagName
        ? newTags.concat([newTagName])
        : newTags.filter(
            (tag) => tag !== tagData.id && tag !== tagData.oppositetag
          )
    )
  }

  const onClickSave = async () => {
    try {
      console.debug(`Saving tags...`, assetId, newTags)

      await save({
        tags: newTags,
      })

      console.debug(`Tags saved`)

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      {isEditing ? (
        <Button onClick={onClickSave} icon={<SaveIcon />}>
          Save
        </Button>
      ) : null}

      {Object.entries(tagDataByCategory).map(
        ([categoryName, tagDatas], index) => (
          <>
            <Heading variant="h2" noTopMargin={index === 0}>
              {categoryName}
            </Heading>
            <Paper className={classes.featureEditors}>
              {tagDatas.map((tagData) => {
                const selectedTagName = newTags.includes(tagData.id)
                  ? tagData.id
                  : tagData.oppositetag && newTags.includes(tagData.oppositetag)
                  ? tagData.oppositetag
                  : null

                const hasFeature = newTags.includes(tagData.id)
                const hasOpposite =
                  tagData.oppositetag && newTags.includes(tagData.oppositetag)

                return isEditing ? (
                  <FeatureEditor
                    key={tagData.id}
                    tagData={tagData}
                    selectedTagName={selectedTagName}
                    onSelectTagName={(newTagName) =>
                      onSelectTagName(tagData, newTagName)
                    }
                  />
                ) : (
                  <div
                    key={tagData.id}
                    title={tagData.id}
                    className={`${classes.item} ${
                      hasFeature && !hasOpposite ? '' : classes.doesNotHave
                    }`}>
                    {hasFeature ? (
                      <CheckIcon />
                    ) : hasOpposite ? (
                      <ClearIcon />
                    ) : (
                      <HelpIcon />
                    )}{' '}
                    {tagData.description}
                  </div>
                )
              })}
            </Paper>
          </>
        )
      )}
      {isEditing ? (
        <>
          <br />
          <Button onClick={onClickSave} icon={<SaveIcon />}>
            Save
          </Button>
        </>
      ) : null}
    </>
  )
}

export default FeaturesEditor
