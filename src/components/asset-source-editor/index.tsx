import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import CheckIcon from '@material-ui/icons/Check'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useSearching from '../../hooks/useSearching'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import AssetResults from '../asset-results'
import Button from '../button'
import FormControls from '../form-controls'
import LoadingIndicator from '../loading-indicator'
import WarningMessage from '../warning-message'
import { Asset } from '../../modules/assets'
import TextInput from '../text-input'

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
  const [newSourceUrl, setNewSourceUrl] = useState<string | undefined>(
    sourceUrl
  )
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
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
        [AssetFieldNames.sourceUrl]: newSourceUrl,
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
        <TextInput
          className={classes.textInput}
          value={newSourceUrl}
          variant="outlined"
          multiline
          isDisabled
        />

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

  const isInvalidPatreonUrl = getIsInvalidPatreonUrl(newSourceUrl)

  return (
    <>
      <TextInput
        className={classes.textInput}
        value={newSourceUrl}
        onChange={(e) => setNewSourceUrl(e.target.value)}
        variant="outlined"
        multiline
      />
      {isInvalidPatreonUrl ? (
        <WarningMessage>
          It looks like you have linked to a Patreon homepage. Please change
          your URL to link directly to your Patreon post (even if it is a locked
          post)
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
