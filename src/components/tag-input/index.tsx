import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { areasByCategory } from '../../areas'
import {
  tagDetailsByCategory,
  TagDetails,
  tags as defaultTagDetails,
  moreTags as moreTagDetails
} from '../../utils/tags'

import FormControls from '../form-controls'
import Button from '../button'
import Heading from '../heading'
import TagChip from '../tag-chip'
import TagTextField from '../tag-text-field'

const useStyles = makeStyles({
  recommendedTags: {
    marginBottom: '1rem'
  },
  textInput: {
    width: '100%',
    margin: '0.5rem 0'
  },
  btns: {
    textAlign: 'center',
    marginTop: '1rem'
  },
  categories: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  category: {
    padding: '0.25rem 0.5rem 0.25rem 0.5rem',
    margin: '0.25rem',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
  },
  categoryName: {
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  hint: {
    fontSize: '75%',
    textAlign: 'center',
    display: 'block',
    fontWeight: 'bold'
  }
})

const RecommendedTags = ({
  newTags,
  onClickWithTag,
  categoryName = undefined
}: {
  newTags: string[]
  onClickWithTag: (tag: string) => void
  categoryName?: string
}) => {
  const classes = useStyles()

  const tagDetailsToUse =
    categoryName && tagDetailsByCategory[categoryName]
      ? tagDetailsByCategory[categoryName]
      : defaultTagDetails

  return (
    <div>
      <div className={classes.categories}>
        {Object.entries(
          tagDetailsToUse.reduce<{ [category: string]: TagDetails[] }>(
            (result, tagDetails) => ({
              ...result,
              [tagDetails.category]: result[tagDetails.category]
                ? result[tagDetails.category].concat([tagDetails])
                : [tagDetails]
            }),
            {}
          )
        ).map(([category, tagDetailItems]: [string, TagDetails[]]) => (
          <div className={classes.category} key={category}>
            <div className={classes.categoryName}>{category}</div>
            <div>
              {tagDetailItems.map(({ tag, description }) => (
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
                    {tags.map(tagName => {
                      const tagDetails = moreTagDetails.find(
                        ({ tag }) => tag === tagName
                      )
                      return (
                        <TagChip
                          key={tagName}
                          tagName={tagName}
                          description={
                            tagDetails ? tagDetails.description : undefined
                          }
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

export default ({
  currentTags = [],
  onChange = undefined,
  onDone = undefined,
  categoryName = undefined,
  showRecommendedTags = true
}: {
  currentTags?: string[]
  onChange?: (newTags: string[]) => void
  onDone?: (newTags: string[]) => void
  categoryName?: string
  showRecommendedTags?: boolean
}) => {
  const [newTags, setNewTags] = useState(currentTags || [])
  const classes = useStyles()

  useEffect(() => {
    if (currentTags) {
      setNewTags(currentTags)
    }
  }, [currentTags ? currentTags.join('+') : null])

  const onNewTags = (tags: string[]) => {
    setNewTags(tags)
    onChange && onChange(tags)
  }

  const addTag = (item: { id: string }) => {
    const newVal = newTags.concat([item.id])

    setNewTags(newVal)

    onChange && onChange(newVal)
  }

  const onDoneClick = () => {
    if (onDone) {
      onDone(newTags)
    }
  }

  return (
    <div>
      {showRecommendedTags && (
        <div className={classes.recommendedTags}>
          <span className={classes.hint}>
            Hover over any tag to learn about it
          </span>
          <RecommendedTags
            newTags={newTags}
            onClickWithTag={tag => addTag({ id: tag })}
            categoryName={categoryName}
          />
        </div>
      )}
      <TagTextField currentTags={newTags} onChange={onNewTags} />
      {onDone && (
        <FormControls>
          <Button onClick={onDoneClick}>Done</Button>
        </FormControls>
      )}
    </div>
  )
}
