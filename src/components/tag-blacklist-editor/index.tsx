import React, { useEffect, useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import useUserPreferences from '../../hooks/useUserPreferences'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import TextInput from '../text-input'
import Button from '../button'
import SuccessMessage from '../success-message'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import { CollectionNames, UserPreferences } from '../../modules/user'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import { cleanupTags } from '../../utils/tags'
import TagChips from '../tag-chips'
import WarningMessage from '../warning-message'

const TagBlacklistEditor = () => {
  const userId = useUserId()
  const [isLoading, lastErrorCodeLoading, preferences, hydrate] =
    useUserPreferences()
  const [isSaving, isSaveSuccess, lastErrorCodeSaving, save] =
    useDataStoreEdit<UserPreferences>(CollectionNames.UserPreferences, userId!)
  const [userInput, setUserInput] = useState('')

  useEffect(() => {
    if (!preferences) {
      return
    }
    setUserInput(preferences.tagblacklist.join(' '))
  }, [preferences !== null])

  if (isLoading) {
    return <LoadingIndicator message="Loading preferences..." />
  }

  if (lastErrorCodeLoading !== null) {
    return (
      <ErrorMessage>
        Failed to load blacklist (code {lastErrorCodeLoading})
      </ErrorMessage>
    )
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving blacklist..." />
  }

  if (lastErrorCodeSaving !== null) {
    return (
      <ErrorMessage>
        Failed to save blacklist (code {lastErrorCodeSaving})
      </ErrorMessage>
    )
  }

  const onClickSave = async () => {
    try {
      const tagBlacklistToSave = cleanupTags(userInput.split(' '))

      await save({
        tagblacklist: tagBlacklistToSave,
      })

      hydrate()
    } catch (err) {
      console.error('Failed to save user prefs', err)
      handleError(err)
    }
  }

  const newTagBlacklist = cleanupTags(userInput.split(' '))

  return (
    <>
      <WarningMessage>
        This feature is currently a WIP and unavailable
      </WarningMessage>
      <p>
        Enter any tags (separated by a space) you want to avoid seeing on the
        site:
      </p>
      <TextInput
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        multiline
        minRows={2}
        label=""
        isDisabled={isLoading || isSaving}
      />
      <p>
        <TagChips tags={newTagBlacklist} />
      </p>{' '}
      <Button
        onClick={onClickSave}
        icon={<SaveIcon />}
        isDisabled={isLoading || isSaving}>
        Save
      </Button>
      {isSaveSuccess && <SuccessMessage>Save successful</SuccessMessage>}
    </>
  )
}

export default TagBlacklistEditor
