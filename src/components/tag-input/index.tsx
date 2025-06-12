import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'

import { areasByCategory } from '../../areas'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import { FullTag } from '../../modules/tags'
import useDelimit from '../../hooks/useDelimit'
import categoryMeta from '../../category-meta'
import {
  getTagFromUserInput,
  removeDuplicates,
  renamedTags,
} from '../../utils/tags'

import useDataStore from '../../hooks/useDataStore'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'

import FormControls from '../form-controls'
import Button from '../button'
import Heading from '../heading'
import TagChip from '../tag-chip'
import AutocompleteInput, { AutocompleteOption } from '../autocomplete-input'
import TagChips from '../tag-chips'
import { Asset } from '../../modules/assets'
import ChatGptSuggestTags from '../chatgpt-suggest-tags'
import { SupabaseClient } from '@supabase/supabase-js'

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

const getActualAutocompleteTagName = (tagName: string): string => {
  for (const [goodTag, badTags] of Object.entries(renamedTags)) {
    if (badTags.includes(tagName)) {
      return goodTag
    }
  }
  return tagName
}

const getActualAutocompleteText = (
  tagName: string,
  intendedText: string
): string => {
  for (const [goodTag, badTags] of Object.entries(renamedTags)) {
    if (badTags.includes(tagName)) {
      return `${tagName} => ${goodTag}`
    }
  }
  return intendedText
}

const areaSuggestions = Object.entries(areasByCategory).reduce<Suggestion[]>(
  (finalTags, [categoryName, areas]) =>
    finalTags.concat(
      Object.values(areas).reduce<Suggestion[]>(
        (tags, area) =>
          tags.concat(
            area.tags.map((tagName) => ({
              id: getActualAutocompleteTagName(tagName),
              text: getActualAutocompleteText(
                tagName,
                `[${categoryMeta[categoryName].name}/${area.namePlural}] ${tagName}`
              ),
            }))
          ),
        []
      )
    ),
  []
)

interface Suggestion {
  id: string
  text: string
}

const renamedSuggestions = Object.entries(renamedTags).reduce<Suggestion[]>(
  (finalTags, [goodTag, badTags]) =>
    finalTags.concat([
      { id: goodTag, text: `${badTags.join('|')} => ${goodTag}` },
    ]),
  []
)

const suggestions: Suggestion[] = areaSuggestions.concat(renamedSuggestions)

const filterSuggestions = (
  suggestions: Suggestion[],
  textInput: string
): Suggestion[] =>
  suggestions.sort((a, b) => {
    const aIncludesInput = String(a.id).includes(textInput)
    const bIncludesInput = String(b.id).includes(textInput)

    if (aIncludesInput && !bIncludesInput) {
      return -1
    } else if (!aIncludesInput && bIncludesInput) {
      return 1
    } else {
      return 0
    }
  })

const TagInput = ({
  currentTags = [],
  onChange = undefined,
  onDone = undefined,
  showRecommendedTags = true,
  showChatGptSuggestions = true,
  asset = undefined,
  isDisabled = false,
  fullWidth = false,
  autoComplete = true,
}: {
  currentTags?: string[]
  onChange?: (newTags: string[]) => void
  onDone?: (newTags: string[]) => void
  showRecommendedTags?: boolean
  showChatGptSuggestions?: boolean
  asset?: Asset
  isDisabled?: boolean
  fullWidth?: boolean
  autoComplete?: boolean
}) => {
  const [textInput, setTextInput] = useState('')
  const [newTags, setNewTags] = useState(currentTags || [])
  const classes = useStyles()

  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useDelimit(
    (supabase: SupabaseClient) => {
      if (textInput.length < 2 || !autoComplete) {
        return null
      }

      let query = supabase
        .rpc<any, FullTag>('autocompletetags', {
          input: textInput,
          include_adult: isAdultContentEnabled,
        })
        .select('*')

      return query
    },
    [textInput, isAdultContentEnabled, autoComplete]
  )

  const [isLoading, , searchResults] = useDataStore<FullTag>(getQuery)

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

  const autoCompleteOptions = autoComplete
    ? ([] as AutocompleteOption<any>[])
        .concat(
          searchResults
            ? searchResults
                .filter((tagInfo) => !newTags.includes(tagInfo.id))
                .map((tagInfo) => ({
                  data: tagInfo.id,
                  label: `${tagInfo.id} (${tagInfo.count || 0})`,
                }))
            : []
        )
        .concat(
          textInput.length > 1
            ? (
                [
                  {
                    data: '',
                    label: 'Category or area:',
                    isDisabled: true,
                  },
                ] as AutocompleteOption<any>[]
              ).concat(
                filterSuggestions(suggestions, textInput)
                  .slice(0, 4)
                  .map((suggestion) => ({
                    data: suggestion.id,
                    label: suggestion.text,
                  }))
              )
            : []
        )
    : []

  return (
    <div className={`${fullWidth ? classes.fullWidth : ''}`}>
      {asset && showChatGptSuggestions && (
        <>
          <ChatGptSuggestTags
            asset={asset}
            currentTags={newTags}
            onDone={(tags) =>
              setNewTags((currentTags) =>
                removeDuplicates(currentTags.concat(tags))
              )
            }
          />
          <br />
        </>
      )}
      <TagChips tags={newTags} onDelete={removeTag} />
      <AutocompleteInput
        value={textInput}
        onNewValue={(newValue) => setTextInput(newValue)}
        options={autoCompleteOptions}
        onSelectedOption={(option) => {
          setTextInput('')
          addTag(getTagFromUserInput(option.data))
        }}
        label={isLoading ? 'Searching...' : 'Start typing a tag...'}
        textFieldProps={{
          fullWidth: true,
          disabled: isDisabled,
        }}
      />
      {showRecommendedTags && (
        <div className={classes.recommendedTags}>
          <RecommendedTags
            newTags={newTags}
            onClickWithTag={(tag) => addTag(tag)}
            categoryName={asset?.category}
          />
        </div>
      )}
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

export default TagInput
