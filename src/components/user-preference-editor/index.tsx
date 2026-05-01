import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'

import { handleError } from '@/error-handling'
import { CollectionNames } from '@/modules/users'
import { UserPreferences } from '@/modules/user'
import { trackAction } from '@/analytics'
import { formHideDelay } from '@/config'

import useUserPreferences from '@/hooks/useUserPreferences'
import useTimer from '@/hooks/useTimer'
import useDataStoreEdit from '@/hooks/useDataStoreEdit'

import ErrorMessage from '@/components/error-message'
import CheckboxInput from '@/components/checkbox-input'

const useStyles = makeStyles({
  savingState: {
    fontWeight: 'bold',
    marginLeft: '1rem',
  },
})

const UserPreferenceEditor = ({
  name,
  label,
  defaultValue,
  onClick,
  analyticsCategoryName,
}: {
  name: keyof UserPreferences
  label: string
  defaultValue: boolean
  onClick?: (newValue: boolean) => void
  analyticsCategoryName?: string
}) => {
  const classes = useStyles()
  const [tempNewValue, setTempNewValue] = useState<boolean | null>(null)
  const [isLoadingUser, lastErrorCodeLoadingUser, userPreferences, hydrate] =
    useUserPreferences(true)
  const [isSaving, isSaveSuccess, lastSaveErrorCode, save, clear] =
    useDataStoreEdit<UserPreferences>(
      CollectionNames.UserPreferences,
      userPreferences ? userPreferences.id : false
    )
  const startTimer = useTimer(clear, formHideDelay)

  if (lastErrorCodeLoadingUser !== null) {
    return (
      <ErrorMessage>
        Failed to load user account (code {lastErrorCodeLoadingUser})
      </ErrorMessage>
    )
  }

  const currentValue = userPreferences
    ? (userPreferences[name] as boolean)
    : false

  const onCheckboxChange = async (newVal: boolean) => {
    try {
      if (onClick) {
        onClick(newVal)
      }

      if (analyticsCategoryName) {
        trackAction(analyticsCategoryName, 'Clicked preference checkbox', {
          name,
          newVal,
        })
      }

      setTempNewValue(newVal)

      await save({
        [name]: newVal,
      })

      hydrate()

      startTimer()
    } catch (err) {
      console.error('Failed to save user to toggle adult flag', err)
      handleError(err)
    }
  }

  return (
    <div>
      <CheckboxInput
        value={tempNewValue !== null ? tempNewValue : currentValue}
        onChange={onCheckboxChange}
        isDisabled={isLoadingUser || isSaving}
        label={label}
      />
      <span className={classes.savingState}>
        {isSaving
          ? 'Saving...'
          : isSaveSuccess
          ? 'Saved!'
          : lastSaveErrorCode !== null
          ? `Failed to save (code ${lastSaveErrorCode})`
          : ''}
      </span>
    </div>
  )
}

export default UserPreferenceEditor
