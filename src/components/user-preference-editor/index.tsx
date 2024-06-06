import React, { SyntheticEvent, useState } from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { CollectionNames, UserPreferences } from '../../modules/user'
import useUserPreferences from '../../hooks/useUserPreferences'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import { trackAction } from '../../analytics'
import useTimer from '../../hooks/useTimer'
import { formHideDelay } from '../../config'

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
  const [isLoadingUser, isErroredUser, userPreferences, hydrate] =
    useUserPreferences(true)
  const [isSaving, isSaveSuccess, isSaveError, save, clear] =
    useDatabaseSave<UserPreferences>(
      CollectionNames.UserPreferences,
      userPreferences ? userPreferences.id : null
    )
  const startTimer = useTimer(clear, formHideDelay)

  if (isErroredUser) {
    return <ErrorMessage>Failed to load user account</ErrorMessage>
  }

  const currentValue = userPreferences
    ? (userPreferences[name] as boolean)
    : false

  const onCheckboxChange = async (event: SyntheticEvent) => {
    const newValue = (event.target as HTMLInputElement).checked

    try {
      if (onClick) {
        onClick(newValue)
      }

      if (analyticsCategoryName) {
        trackAction(analyticsCategoryName, 'Clicked preference checkbox', {
          name,
          newValue,
        })
      }

      setTempNewValue(newValue)

      await save({
        [name]: newValue,
      })

      hydrate()

      startTimer()
    } catch (err) {
      console.error('Failed to save user to toggle adult flag', err)
      handleError(err)
    }
  }

  return (
    <FormControl>
      <FormControlLabel
        control={
          <Checkbox
            checked={tempNewValue !== null ? tempNewValue : currentValue}
            onChange={onCheckboxChange}
            disabled={isLoadingUser || isSaving}
          />
        }
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
    </FormControl>
  )
}

export default UserPreferenceEditor
