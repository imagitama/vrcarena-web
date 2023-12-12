import React, { useState, useEffect, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { client as supabase } from '../../supabase'
import { areasByCategory } from '../../areas'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import { FullTag, Tag } from '../../modules/tags'

import FormControls from '../form-controls'
import Button from '../button'
import Heading from '../heading'
import TagChip from '../tag-chip'
import AutocompleteInput from '../autocomplete-input'
import useDataStore from '../../hooks/useDataStore'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import TagChips from '../tag-chips'
import useDelimit from '../../hooks/useDelimit'

const useStyles = makeStyles({
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
    'all-tags-browser'
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

export default ({
  currentTags = [],
  onChange = undefined,
  onDone = undefined,
  categoryName = undefined,
  showRecommendedTags = true,
}: {
  currentTags?: string[]
  onChange?: (newTags: string[]) => void
  onDone?: (newTags: string[]) => void
  categoryName?: string
  showRecommendedTags?: boolean
}) => {
  const [textInput, setTextInput] = useState('')
  const [newTags, setNewTags] = useState(currentTags || [])
  const classes = useStyles()

  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useDelimit(() => {
    if (textInput.length < 2) {
      return null
    }

    let query = supabase
      .rpc<FullTag>('autocompletetags', {
        input: textInput,
      })
      .select('*')

    query = isAdultContentEnabled === false ? query.is('isadult', false) : query

    return query
  }, [textInput, isAdultContentEnabled])

  const [isLoading, isError, searchResults] = useDataStore<FullTag[]>(getQuery)

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

  const autoCompleteOptions = searchResults
    ? searchResults
        .filter((tagInfo) => !newTags.includes(tagInfo.id))
        .map((tagInfo) => ({
          data: tagInfo.id,
          label: `${tagInfo.id} (${tagInfo.count || 0})`,
        }))
    : []

  return (
    <div>
      <TagChips tags={newTags} onDelete={removeTag} />
      <AutocompleteInput
        value={textInput}
        onNewValue={(newValue) => setTextInput(newValue)}
        options={autoCompleteOptions}
        onSelectedOption={(option) => {
          setTextInput('')
          addTag(option.data)
        }}
        label={isLoading ? 'Searching...' : 'Start typing a tag...'}
        textFieldProps={{
          fullWidth: true,
        }}
      />
      {showRecommendedTags && (
        <div className={classes.recommendedTags}>
          <RecommendedTags
            newTags={newTags}
            onClickWithTag={(tag) => addTag(tag)}
            categoryName={categoryName}
          />
        </div>
      )}
      {onDone && (
        <FormControls>
          <Button onClick={onDoneClick}>Done</Button>
        </FormControls>
      )}
    </div>
  )
}
