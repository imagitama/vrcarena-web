import React, { useEffect, useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import { CollectionNames } from '@/modules/users'
import { UserPreferences } from '@/modules/user'
import { handleError } from '@/error-handling'
import { cleanupTags } from '@/utils/tags'

import useUserPreferences from '@/hooks/useUserPreferences'
import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useUserId from '@/hooks/useUserId'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import TextInput from '@/components/text-input'
import Button from '@/components/button'
import SuccessMessage from '@/components/success-message'
import TagChips from '@/components/tag-chips'
import WarningMessage from '@/components/warning-message'

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
