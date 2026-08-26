import React, { useEffect, useState } from 'react'

import { handleError } from '@/error-handling'
import { DataStoreErrorCode, PostgresErrorCode } from '@/data-store'
import { User } from '@/modules/users'
import { CollectionNames } from '@/modules/users'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useUserRecord from '@/hooks/useUserRecord'
import useUserId from '@/hooks/useUserId'

import { SaveButton } from '@/components/button'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import TextInput from '../text-input'
import SuccessMessage from '../success-message'
import useTimer from '@/hooks/useTimer'

const getMessageForErrorCode = (errorCode: DataStoreErrorCode): string => {
  if (errorCode === PostgresErrorCode.UniqueViolation) {
    return 'Username is taken'
  }
  return `code ${errorCode}`
}

const UsernameEditor = ({ onSaveClick }: { onSaveClick?: () => void }) => {
  const userId = useUserId()
  const [isLoadingUser, lastErrorCodeLoadingUser, user, hydrateUser] =
    useUserRecord()
  const [isSaving, isSuccess, lastErrorCode, save, clear] =
    useDataStoreEdit<User>(CollectionNames.Users, userId || false, {
      uncatchErrorCodes: [PostgresErrorCode.UniqueViolation],
    })
  const [fieldValue, setFieldValue] = useState('')
  const clearAfterDelay = useTimer(clear)

  useEffect(() => {
    if (!user) {
      return
    }
    setFieldValue(user.username)
  }, [user ? user.username : null])

  if (!userId || isLoadingUser || !user) {
    return <LoadingIndicator message="Loading your user details..." />
  }

  if (lastErrorCodeLoadingUser !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCodeLoadingUser}>
        Failed to load your user account
      </ErrorMessage>
    )
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

      const result = await save({
        username: fieldValue,
      })

      if (result) {
        hydrateUser()

        clearAfterDelay()
      }
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
    <div>
      <TextInput
        value={fieldValue}
        onChange={(event) => setFieldValue(event.target.value)}
        onKeyDown={(event) =>
          event.key === 'Enter' ? onSaveBtnClick() : undefined
        }
        variant="outlined"
        fullWidth
        label="Enter a username"
        button={
          <SaveButton onClick={onSaveBtnClick} color="primary" hollow={false}>
            Save
          </SaveButton>
        }
      />{' '}
      {isSaving ? (
        <LoadingIndicator message="Saving..." />
      ) : isSuccess ? (
        <SuccessMessage>Username changed successfully</SuccessMessage>
      ) : lastErrorCode ? (
        <ErrorMessage
          errorCode={
            lastErrorCode !== PostgresErrorCode.UniqueViolation
              ? lastErrorCode
              : undefined
          }>
          Failed to change username: {getMessageForErrorCode(lastErrorCode)}
        </ErrorMessage>
      ) : (
        ''
      )}
    </div>
  )
}

export default UsernameEditor
