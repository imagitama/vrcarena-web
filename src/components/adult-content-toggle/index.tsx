import React, { SyntheticEvent } from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { CollectionNames, UserPreferencesFieldNames } from '../../modules/user'
import useUserPreferences from '../../hooks/useUserPreferences'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'

export default ({
  onClick = undefined,
}: {
  onClick?: ({ newValue }: { newValue: boolean }) => void
}) => {
  const [isLoadingUser, isErroredUser, userPreferences, hydrate] =
    useUserPreferences()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.UserPreferences,
    userPreferences ? userPreferences.id : null
  )

  if (isLoadingUser || !userPreferences || isSaving) {
    return <LoadingIndicator message={isSaving ? 'Saving...' : 'Loading...'} />
  }

  if (isErroredUser) {
    return <ErrorMessage>Failed to load user account</ErrorMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save your changes</ErrorMessage>
  }

  const { enabledadultcontent: enabledAdultContent } = userPreferences

  const onCheckboxChange = async (event: SyntheticEvent) => {
    const newValue = (event.target as HTMLInputElement).checked

    try {
      if (onClick) {
        onClick({ newValue })
      }

      await save({
        [UserPreferencesFieldNames.enabledAdultContent]: newValue,
      })

      hydrate()
    } catch (err) {
      console.error('Failed to save user to toggle adult flag', err)
      handleError(err)
    }
  }

  return (
    <FormControl>
      <FormControlLabel
        control={
          <Checkbox checked={enabledAdultContent} onChange={onCheckboxChange} />
        }
        label="I am over 18 and I want to view adult content."
      />
      {isSaveSuccess && 'Saved successfully'}
    </FormControl>
  )
}
