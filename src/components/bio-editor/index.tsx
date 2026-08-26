import React, { useState, useEffect } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import useUserId from '@/hooks/useUserId'
import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import { handleError } from '@/error-handling'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import { User } from '@/modules/users'
import { CollectionNames } from '@/modules/users'

import SuccessMessage from '@/components/success-message'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import Button from '@/components/button'
import MarkdownEditor from '../markdown-editor'
import FormControls from '../form-controls'

const BioEditor = ({
  onSaveClick = undefined,
}: {
  onSaveClick?: () => void
}) => {
  const userId = useUserId()
  const [isLoadingProfile, lastErrorCodeLoadingProfile, profile] =
    useDataStoreItem<User>(CollectionNames.Users, userId ? userId : false, {
      queryName: 'bio-editor',
    })
  const [isSaving, isSuccess, lastErrorCodeSaving, save] = useDataStoreEdit(
    CollectionNames.Users,
    userId!
  )
  const [bioValue, setBioValue] = useState('')

  useEffect(() => {
    if (!profile || !profile.bio) {
      return
    }
    setBioValue(profile.bio)
  }, [profile && profile.id])

  const onSaveBtnClick = async () => {
    try {
      if (onSaveClick) {
        onSaveClick()
      }

      await save({
        bio: bioValue,
      })
    } catch (err) {
      console.error('Failed to save social media fields to database', err)
      handleError(err)
    }
  }

  if (lastErrorCodeLoadingProfile !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCodeLoadingProfile}>
        Failed to lookup your user profile
      </ErrorMessage>
    )
  }

  return (
    <>
      <MarkdownEditor
        content={bioValue}
        onChange={(newVal) => setBioValue(newVal)}
        isDisabled={isSaving || isLoadingProfile}
      />
      <FormControls>
        <Button
          onClick={onSaveBtnClick}
          isDisabled={isSaving || isLoadingProfile}
          icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
      {isSaving && <LoadingIndicator message="Saving..." />}
      {isSuccess ? (
        <SuccessMessage>Your bio has been saved</SuccessMessage>
      ) : lastErrorCodeSaving !== null ? (
        <ErrorMessage errorCode={lastErrorCodeSaving}>
          Failed to save bio
        </ErrorMessage>
      ) : null}
    </>
  )
}

export default BioEditor
