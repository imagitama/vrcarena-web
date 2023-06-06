import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, UserFieldNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'

const useStyles = makeStyles({
  fieldWrapper: {
    display: 'flex',
    '& > *:first-child': {
      marginRight: '0.5rem'
    }
  }
})

export default ({ onSaveClick }: { onSaveClick?: () => void }) => {
  const userId = useUserId()
  const [isLoadingUser, isErrorLoadingUser, user, hydrate] = useUserRecord()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )
  const [fieldValue, setFieldValue] = useState('')
  const classes = useStyles()

  if (!userId || isLoadingUser || !user) {
    return <LoadingIndicator message="Loading your user details..." />
  }

  if (isErrorLoadingUser) {
    return <ErrorMessage>Failed to load your user account</ErrorMessage>
  }

  const { username } = user

  const onSaveBtnClick = async () => {
    try {
      if (onSaveClick) {
        onSaveClick()
      }

      if (!fieldValue) {
        return
      }

      await save({
        [UserFieldNames.username]: fieldValue
      })

      hydrate()
    } catch (err) {
      console.error(
        'Failed to edit username',
        { userId: user.id, newUsername: fieldValue },
        err
      )
      handleError(err)
    }
  }

  return (
    <>
      <div className={classes.fieldWrapper}>
        <TextField
          defaultValue={username}
          onChange={event => setFieldValue(event.target.value)}
          variant="outlined"
          fullWidth
        />{' '}
        <Button color="primary" onClick={onSaveBtnClick} size="large">
          Save
        </Button>
      </div>
      {isSaving ? (
        <LoadingIndicator message="Saving..." />
      ) : isSaveSuccess ? (
        <SuccessMessage>Username saved successfully</SuccessMessage>
      ) : isSaveError ? (
        <ErrorMessage hintText={false}>
          Failed to save your username - please try a different username
        </ErrorMessage>
      ) : null}
    </>
  )
}
