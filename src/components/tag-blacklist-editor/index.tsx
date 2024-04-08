import React, { useEffect, useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'

import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import useUserPreferences from '../../hooks/useUserPreferences'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import TextInput from '../text-input'
import Button from '../button'
import SuccessMessage from '../success-message'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, UserPreferences } from '../../modules/user'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import { cleanupTags } from '../../utils/tags'
import TagChips from '../tag-chips'
import WarningMessage from '../warning-message'

const TagBlacklistEditor = () => {
  const isLoggedIn = useIsLoggedIn()
  const userId = useUserId()
  const [isLoading, lastError, preferences, hydrate] = useUserPreferences()
  const [isSaving, isSaveSuccess, isSaveError, save] =
    useDatabaseSave<UserPreferences>(
      CollectionNames.UserPreferences,
      isLoggedIn && userId ? userId : null
    )
  const [userInput, setUserInput] = useState('')

  useEffect(() => {
    if (!preferences) {
      return
    }
    setUserInput(preferences.tagblacklist.join(' '))
  }, [preferences !== null])

  if (!isLoggedIn) {
    return null
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading preferences..." />
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving blacklist..." />
  }

  if (lastError) {
    return <ErrorMessage>Failed to save blacklist</ErrorMessage>
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
        rows={2}
        label=""
      />
      <p>
        <TagChips tags={newTagBlacklist} />
      </p>{' '}
      <Button onClick={onClickSave} icon={<SaveIcon />}>
        Save
      </Button>
      {isSaveSuccess && <SuccessMessage>Save successful</SuccessMessage>}
    </>
  )
}

export default TagBlacklistEditor
