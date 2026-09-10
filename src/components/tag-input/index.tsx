import React, { useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import { areasByCategory } from '@/areas'
import categoryMeta from '@/category-meta'
import { getTagFromUserInput, renamedTags } from '@/utils/tags'
import { FullTag } from '@/modules/tags'

import useDelimit from '@/hooks/useDelimit'
import useDataStore from '@/hooks/useDataStore'
import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'

import AutocompleteInput, {
  AutocompleteOption,
} from '@/components/autocomplete-input'

interface Suggestion {
  id: string
  text: string
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

enum FunctionNames {
  AutocompleteTags = 'autocompletetags',
}

const TagInput = ({
  isDisabled,
  autoComplete = true,
  onNewTag,
  existingTags,
}: {
  isDisabled?: boolean
  autoComplete?: boolean
  onNewTag: (tagName: string) => void
  existingTags?: string[]
}) => {
  const [textInput, setTextInput] = useState('')
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useDelimit(
    (supabase: SupabaseClient) => {
      if (textInput.length < 2 || !autoComplete) {
        return null
      }

      // TODO: use hook
      let query = supabase
        .rpc<any, FullTag>(FunctionNames.AutocompleteTags, {
          input: textInput,
          include_adult: isAdultContentEnabled,
        })
        .select('*')

      return query
    },
    [textInput, isAdultContentEnabled, autoComplete]
  )

  const [isLoading, , searchResults] = useDataStore<FullTag>(getQuery)

  const autoCompleteOptions = autoComplete
    ? ([] as AutocompleteOption<any>[])
        .concat(
          searchResults
            ? searchResults
                .filter((tagInfo) =>
                  existingTags ? !existingTags.includes(tagInfo.id) : true
                )
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
    // wrap in div for styling
    <div>
      <AutocompleteInput
        value={textInput}
        onNewValue={(newValue) => setTextInput(newValue)}
        options={autoCompleteOptions}
        onSelectedOption={(option) => {
          setTextInput('')
          onNewTag(getTagFromUserInput(option.data))
        }}
        label={isLoading ? 'Searching...' : 'Start typing a tag...'}
        textFieldProps={{
          fullWidth: true,
          disabled: isDisabled,
          size: 'small',
        }}
      />
    </div>
  )
}

export default TagInput
