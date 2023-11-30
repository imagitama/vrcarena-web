import React, { useState, useEffect, useRef } from 'react'
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
import LoadingIndicator from '../loading-indicator'
import FormControls from '../form-controls'
import Heading from '../heading'

const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.primary.light,
    '&:focus': {
      outline: 'none',
    },
  },
}))

export default ({
  assetId,
  title = null,
  onDone = null,
  actionCategory,
  overrideSave = null,
}) => {
  const [newTitleValue, setNewTitleValue] = useState(title || '(no title)')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSaving, isSaveSuccess, lastError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const titleRef = useRef()
  const [isSearching, , searchResults] = useSearching(
    CollectionNames.Assets,
    searchTerm,
    '*',
    [AssetFieldNames.title],
    null,
    5
  )

  useEffect(() => {
    if (titleRef.current) {
      console.debug(`Focusing on title element...`)
      titleRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (!searchTerm || !searchResults || isSearching) {
      return
    }

    const searchResultsWithoutSelf = searchResults
      ? searchResults.filter(({ id }) => id !== assetId)
      : null

    if (!searchResultsWithoutSelf.length) {
      onSave()
    }
  }, [searchTerm, isSearching, searchResults && searchResults.length])

  const onSave = async () => {
    try {
      if (overrideSave) {
        overrideSave(newTitleValue)

        if (onDone) {
          onDone()
        }
        return
      }

      trackAction(actionCategory, 'Click save title button')

      if (newTitleValue === title) {
        console.warn(
          'Cannot save the asset title: new title is the same as the original'
        )
        onDone()
        return
      }

      await save({
        [AssetFieldNames.title]: newTitleValue,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset title', err)
      handleError(err)
    }
  }

  const searchForDuplicates = () => {
    setSearchTerm(newTitleValue)
  }

  const confirmedNotDuplicate = () => {
    onSave()
  }

  if (searchTerm) {
    const searchResultsWithoutSelf = searchResults
      ? searchResults.filter(({ id }) => id !== assetId)
      : null

    return (
      <>
        <Heading variant="h1">
          <span className={classes.title}>{newTitleValue}</span>
        </Heading>
        {isSearching ? (
          <LoadingIndicator message="Checking for duplicates..." />
        ) : searchResultsWithoutSelf && searchResultsWithoutSelf.length ? (
          <>
            <p>We found these assets that have a similar name to yours:</p>
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

  return (
    <>
      <Heading variant="h1">
        <span
          ref={titleRef}
          contentEditable={!isSaving}
          onKeyUp={(e) => setNewTitleValue(e.target.innerText)}
          className={classes.title}>
          {title || '(no title)'}
        </span>
      </Heading>
      {isSaving ? (
        <LoadingIndicator message="Saving..." />
      ) : isSaveSuccess ? (
        'Saved!'
      ) : lastError ? (
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
