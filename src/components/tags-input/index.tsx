import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'

import { areasByCategory } from '@/areas'
import { routes } from '@/routes'
import { FullTag } from '@/modules/tags'
import { Asset } from '@/modules/assets'

import useDataStoreItems from '@/hooks/useDataStoreItems'

import FormControls from '@/components/form-controls'
import Button from '@/components/button'
import Heading from '@/components/heading'
import TagChip from '@/components/tag-chip'
import TagChips from '@/components/tag-chips'
import NoResultsMessage from '@/components/no-results-message'
import TagInput from '@/components/tag-input'

const useStyles = makeStyles({
  fullWidth: {
    width: '100%',
  },
  recommendedTags: {
    marginBottom: '1rem',
  },
  textInput: {
    width: '100%',
    margin: '0.5rem 0',
  },
  btns: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  categories: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  category: {
    padding: '0.25rem 0.5rem 0.25rem 0.5rem',
    margin: '0.25rem',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
  },
  categoryName: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  hint: {
    fontSize: '75%',
    textAlign: 'center',
    display: 'block',
    fontWeight: 'bold',
  },
  btn: {
    '&&': {
      marginTop: '0.25rem',
    },
  },
})

const RecommendedTags = ({
  newTags,
  onClickWithTag,
  categoryName = undefined,
}: {
  newTags: string[]
  onClickWithTag: (tag: string) => void
  categoryName?: string
}) => {
  const classes = useStyles()
  const [, , allTagDetails] = useDataStoreItems<FullTag>(
    'getfulltags',
    undefined,
    { queryName: 'all-tags-browser' }
  )

  if (!allTagDetails) {
    return null
  }

  return (
    <div>
      <div className={classes.categories}>
        {Object.entries(
          allTagDetails.reduce<{ [category: string]: FullTag[] }>(
            (result, tagDetails) => ({
              ...result,
              [tagDetails.category]: result[tagDetails.category]
                ? result[tagDetails.category].concat([tagDetails])
                : [tagDetails],
            }),
            {}
          )
        ).map(([category, tagDetailItems]: [string, FullTag[]]) => (
          <div className={classes.category} key={category}>
            <div className={classes.categoryName}>{category}</div>
            <div>
              {tagDetailItems.map(({ id: tag, description }) => (
                <TagChip
                  key={tag}
                  tagName={tag}
                  description={description}
                  isDisabled={newTags.includes(tag)}
                  onClick={() => onClickWithTag(tag)}
                  isFilled={false}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {categoryName && (
        <>
          <Heading variant="h3">Areas for your category</Heading>
          <div className={classes.categories}>
            {Object.entries(areasByCategory[categoryName]).map(
              ([areaName, { namePlural, tags }]) => (
                <div className={classes.category} key={areaName}>
                  <div className={classes.categoryName}>{namePlural}</div>
                  <div>
                    {tags.map((tagName) => {
                      return (
                        <TagChip
                          key={tagName}
                          tagName={tagName}
                          isDisabled={newTags.includes(tagName)}
                          onClick={() => onClickWithTag(tagName)}
                          isFilled={false}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}

export interface TagsInputSettings {
  showRecommendedTags?: boolean
  autoComplete?: boolean
}

const TagsInput = ({
  currentTags = [],
  onChange = undefined,
  onDone = undefined,
  showRecommendedTags = true,
  asset = undefined,
  isDisabled = false,
  fullWidth = false,
  autoComplete = true,
}: {
  currentTags?: string[]
  onChange?: (newTags: string[]) => void
  onDone?: (newTags: string[]) => void
  fullWidth?: boolean
  asset?: Asset
  isDisabled?: boolean
} & TagsInputSettings) => {
  const [newTags, setNewTags] = useState(currentTags || [])
  const classes = useStyles()
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (currentTags) {
      setNewTags(currentTags)
    }
  }, [currentTags ? currentTags.join('+') : null])

  const addTag = (tag: string) => {
    if (newTags.includes(tag)) {
      return
    }

    const newVal = newTags.concat(tag)

    setNewTags(newVal)

    onChange && onChange(newVal)
  }

  const removeTag = (tagToRemove: string) => {
    const newVal = newTags.filter((tag) => tag !== tagToRemove)

    setNewTags(newVal)

    onChange && onChange(newVal)
  }

  const onDoneClick = () => {
    if (onDone) {
      onDone(newTags)
    }
  }

  return (
    <div className={`${fullWidth ? classes.fullWidth : ''}`}>
      {newTags.length ? (
        <TagChips tags={newTags} onDelete={removeTag} />
      ) : (
        <NoResultsMessage>No tags yet</NoResultsMessage>
      )}
      <TagInput onNewTag={addTag} />
      <div>
        <Button
          url={routes.createTagSuggestion}
          color="secondary"
          hollow={false}
          title="Do you have an idea for a new official tag? Or dislike an existing one? You can suggest it by clicking this button.">
          Suggest Tag Change
        </Button>
        <br />
        *redirects to page (ensure your asset is saved)
      </div>
      {showRecommendedTags ? (
        isExpanded ? (
          <div className={classes.recommendedTags}>
            <RecommendedTags
              newTags={newTags}
              onClickWithTag={(tag) => addTag(tag)}
              categoryName={asset?.category}
            />
          </div>
        ) : (
          <Button
            onClick={() => setIsExpanded(true)}
            color="secondary"
            size="small"
            className={classes.btn}>
            Show Recommended Tags
          </Button>
        )
      ) : null}
      {onDone && (
        <FormControls>
          <Button onClick={onDoneClick} isDisabled={isDisabled}>
            Done
          </Button>
        </FormControls>
      )}
    </div>
  )
}

export default TagsInput
