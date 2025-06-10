import React from 'react'
import AddIcon from '@material-ui/icons/Add'
import BubbleChartIcon from '@material-ui/icons/BubbleChart'

import useFirebaseFunction from '../../hooks/useFirebaseFunction'
import { Asset } from '../../modules/assets'

import Button from '../button'
import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import Heading from '../heading'
import TagChips from '../tag-chips'
import { useEffect, useState } from 'react'
import LoadingIndicator from '../loading-indicator'
import TagChip from '../tag-chip'
import ExperimentalMessage from '../experimental-message'

interface Payload {
  title: string
  description: string
}

interface Result {
  suggestions: TagSuggestion[]
}

interface TagSuggestion {
  tag: string
  reason: string
}

const ChatGptSuggestTags = ({
  asset,
  currentTags,
  onDone,
}: {
  asset: Asset
  currentTags: string[]
  onDone: (tags: string[]) => void
}) => {
  const [finalTags, setFinalTags] = useState<string[] | null>(null)
  const [isLoading, isErrored, result, performCall, clear] =
    useFirebaseFunction<Payload, Result>('suggestTags')

  useEffect(() => {
    if (!result) {
      return
    }
    setFinalTags(result.suggestions.map((suggestion) => suggestion.tag))
  }, [result !== null ? JSON.stringify(result) : null])

  return (
    <ExperimentalMessage title="Tag Assistant">
      <p>
        Try out our new tag assistant that uses your title and description to
        suggest tags.
      </p>
      {result && finalTags ? (
        <>
          <Heading variant="h3">Suggestions</Heading>
          {result.suggestions
            .filter((suggestion) => finalTags.includes(suggestion.tag))
            .map((suggestion) => (
              <div key={suggestion.tag}>
                <TagChip
                  tagName={suggestion.tag}
                  isFilled={false}
                  isDisabled={currentTags.includes(suggestion.tag)}
                  onDelete={() =>
                    setFinalTags((currentTags) =>
                      currentTags
                        ? currentTags.filter((tag) => tag !== suggestion.tag)
                        : []
                    )
                  }
                  noLink
                />{' '}
                {suggestion.reason}
              </div>
            ))}
          <Heading variant="h3">These tags will be added</Heading>
          <TagChips
            tags={finalTags.filter((tag) => !currentTags.includes(tag))}
            isFilled={false}
            noLink
          />
          <FormControls>
            <Button
              onClick={() => {
                onDone(finalTags)
                setFinalTags(null)
              }}
              icon={<AddIcon />}>
              Add These Tags
            </Button>
          </FormControls>
        </>
      ) : null}
      {isLoading ? <LoadingIndicator message="Getting tags..." /> : null}
      {isErrored ? (
        <ErrorMessage>Failed to ask for tags (maybe it's down?)</ErrorMessage>
      ) : null}
      <br />
      <FormControls>
        <Button
          size="large"
          color="default"
          isDisabled={isLoading}
          icon={<BubbleChartIcon />}
          onClick={() => {
            performCall({
              title: asset.title,
              description: asset.description,
            })
          }}>
          Suggest Tags
        </Button>
      </FormControls>
    </ExperimentalMessage>
  )
}

export default ChatGptSuggestTags
