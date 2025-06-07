import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import CheckIcon from '@material-ui/icons/Check'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useSearching from '../../hooks/useSearching'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import AssetResults from '../asset-results'
import Button from '../button'
import FormControls from '../form-controls'
import LoadingIndicator from '../loading-indicator'
import WarningMessage from '../warning-message'
import { Asset, CollectionNames } from '../../modules/assets'
import TextInput from '../text-input'
import { cleanupSourceUrl } from '../../utils/assets'
import VisitSourceButton from '../visit-source-button'
import { getIsDiscordMessageUrl, getIsDiscordUrl } from '../../discord'

const useStyles = makeStyles({
  textInput: {
    width: '100%',
  },
})

const getIsInvalidPatreonUrl = (url?: string): boolean => {
  if (url && url.includes('patreon') && !url.includes('posts')) {
    return true
  }
  return false
}

export default ({
  assetId,
  sourceUrl = undefined,
  onDone = undefined,
  actionCategory,
  overrideSave = undefined,
}: {
  assetId: string | null
  sourceUrl?: string
  onDone?: () => void
  actionCategory?: string
  overrideSave?: (newUrl: string | undefined) => void
}) => {
  const [userInput, setUserInput] = useState<string>(sourceUrl || '')
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave<Asset>(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const [searchTerm, setSearchTerm] = useState<string | undefined>('')
  const [isSearching, , searchResults] = useSearching<Asset>(
    CollectionNames.Assets,
    searchTerm || '',
    '*',
    ['sourceurl'],
    undefined,
    5
  )

  const newSourceUrl = cleanupSourceUrl(userInput)

  const onSave = async () => {
    try {
      if (overrideSave) {
        overrideSave(newSourceUrl)

        if (onDone) {
          onDone()
        }
        return
      }

      if (actionCategory) {
        trackAction(actionCategory, 'Click save asset source button', assetId)
      }

      await save({
        sourceurl: newSourceUrl,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset source URL', err)
      handleError(err)
    }
  }

  const searchForDuplicates = () => {
    setSearchTerm(newSourceUrl)
  }

  const confirmedNotDuplicate = () => {
    onSave()
  }

  useEffect(() => {
    if (!searchTerm || !searchResults || isSearching) {
      return
    }

    const searchResultsWithoutSelf = searchResults
      ? searchResults.filter(({ id }) => id !== assetId)
      : null

    if (searchResultsWithoutSelf && !searchResultsWithoutSelf.length) {
      onSave()
    }
  }, [searchTerm, isSearching, searchResults && searchResults.length])

  if (searchTerm) {
    const searchResultsWithoutSelf = searchResults
      ? searchResults.filter(({ id }) => id !== assetId)
      : null

    return (
      <>
        {isSearching ? (
          <LoadingIndicator message="Checking for duplicates..." />
        ) : searchResultsWithoutSelf && searchResultsWithoutSelf.length ? (
          <>
            <p>
              We found these assets that have a similar source URL to yours:
            </p>
            <AssetResults assets={searchResultsWithoutSelf} />
            <p>
              <strong>
                Are you sure your asset has not already been published?
              </strong>
            </p>
            <FormControls>
              <Button icon={<CheckIcon />} onClick={confirmedNotDuplicate}>
                Yes I'm sure
              </Button>
            </FormControls>
          </>
        ) : (
          <LoadingIndicator />
        )}
      </>
    )
  }

  const isInvalidPatreonUrl = getIsInvalidPatreonUrl(userInput)

  return (
    <>
      <TextInput
        className={classes.textInput}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        variant="outlined"
        multiline
      />
      <br />
      Preview:
      <br />
      <br />
      <VisitSourceButton
        sourceInfo={{
          url: newSourceUrl,
          price: null,
          pricecurrency: null,
          comments: '',
        }}
      />
      {isInvalidPatreonUrl ? (
        <WarningMessage>
          It looks like you have linked to a Patreon homepage. Please change
          your URL to link directly to your Patreon post (even if it is a locked
          post)
        </WarningMessage>
      ) : null}
      {getIsDiscordUrl(userInput) && !getIsDiscordMessageUrl(userInput) ? (
        <WarningMessage>
          It looks like you have linked to a Discord server invite. We recommend
          that you link directly to the message in your server that has the
          asset. Then go to the "Extra" tab and connect your Discord server and
          provide the invite URL there.
          <br />
          <br />
          Example good URL:
          <br />
          https://discord.com/channels/734993431507763289/736972936581349506/1338845707876044851
          <br />
          <br />
          Bad URL:
          <br />
          https://discord.gg/T5x8gQwK
        </WarningMessage>
      ) : null}
      {isSaving ? (
        <LoadingIndicator message="Saving..." />
      ) : isSaveSuccess ? (
        'Saved!'
      ) : isSaveError ? (
        'Failed to save'
      ) : (
        <FormControls>
          <Button icon={<ChevronRightIcon />} onClick={searchForDuplicates}>
            Continue
          </Button>
        </FormControls>
      )}
    </>
  )
}
