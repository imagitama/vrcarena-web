import React, { useEffect, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import useUserRecord from '../../hooks/useUserRecord'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import { DataStoreErrorCode } from '../../data-store'
import { User } from '../../modules/users'
import { CollectionNames } from '../../modules/user'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& button': {
      height: '100%',
      margin: '0 0.25rem',
    },
  },
})

const getMessageForErrorCode = (errorCode: DataStoreErrorCode): string => {
  if (errorCode === DataStoreErrorCode.ViolateUniqueConstraint) {
    return 'Username is taken'
  }
  return `Failed to save username (code ${errorCode})`
}

const UsernameEditor = ({ onSaveClick }: { onSaveClick?: () => void }) => {
  const userId = useUserId()
  const [isLoadingUser, isErrorLoadingUser, user, hydrate] = useUserRecord()
  const [isSaving, isSaveSuccess, lastSaveErrorCode, save] =
    useDataStoreEdit<User>(CollectionNames.Users, userId || false, {
      uncatchErrorCodes: [DataStoreErrorCode.ViolateUniqueConstraint],
    })

  if (!user) {
    throw new Error('Need a user')
  }

  const { username } = user
  const [fieldValue, setFieldValue] = useState(username)
  const classes = useStyles()

  useEffect(() => {
    setFieldValue(username)
  }, [username])

  if (!userId || isLoadingUser || !user) {
    return <LoadingIndicator message="Loading your user details..." />
  }

  if (isErrorLoadingUser) {
    return <ErrorMessage>Failed to load your user account</ErrorMessage>
  }

  const onSaveBtnClick = async () => {
    try {
      if (onSaveClick) {
        onSaveClick()
      }

      if (!fieldValue) {
        console.warn('No field value set')
        return
      }

      await save({
        username: fieldValue,
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
    <div className={classes.root}>
      <TextField
        value={fieldValue}
        onChange={(event) => setFieldValue(event.target.value)}
        variant="outlined"
        fullWidth
        label="Enter a username"
      />{' '}
      <Button
        color="primary"
        onClick={onSaveBtnClick}
        size="large"
        icon={<SaveIcon />}>
        Save
      </Button>{' '}
      {isSaving
        ? 'Saving...'
        : isSaveSuccess
        ? 'Saved!'
        : lastSaveErrorCode
        ? getMessageForErrorCode(lastSaveErrorCode)
        : ''}
    </div>
  )
}

export default UsernameEditor
