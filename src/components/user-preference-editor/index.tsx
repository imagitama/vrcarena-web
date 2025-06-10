import React, { SyntheticEvent, useState } from 'react'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import { makeStyles } from '@mui/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { CollectionNames, UserPreferences } from '../../modules/user'
import useUserPreferences from '../../hooks/useUserPreferences'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import { trackAction } from '../../analytics'
import useTimer from '../../hooks/useTimer'
import { formHideDelay } from '../../config'
import CheckboxInput from '../checkbox-input'

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
  const [isLoadingUser, lastErrorcodeLoadingUser, userPreferences, hydrate] =
    useUserPreferences(true)
  const [isSaving, isSaveSuccess, isSaveError, save, clear] =
    useDatabaseSave<UserPreferences>(
      CollectionNames.UserPreferences,
      userPreferences ? userPreferences.id : null
    )
  const startTimer = useTimer(clear, formHideDelay)

  if (lastErrorcodeLoadingUser !== null) {
    return (
      <ErrorMessage>
        Failed to load user account (code {lastErrorcodeLoadingUser})
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
          : isSaveError
          ? 'Failed to save'
          : ''}
      </span>
    </div>
  )
}

export default UserPreferenceEditor
