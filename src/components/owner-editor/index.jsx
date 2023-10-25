import React, { useEffect, useState } from 'react'
import AccessibilityIcon from '@material-ui/icons/Accessibility'

import Button from '../button'
import SearchForIdForm from '../search-for-id-form'

import useDatabaseQuery, {
  CollectionNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'
import { CommonFieldNames } from '../../data-store'

export default ({ collectionName, id, actionCategory }) => {
  const userId = useUserId()
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    collectionName,
    id
  )
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  if (!userId) {
    return 'You are not logged in'
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isSuccess) {
    return 'Owner has been changed'
  }

  if (isFailed) {
    return 'Error saving new owner'
  }

  const onSave = async (newOwnerId = null) => {
    try {
      if (newOwnerId) {
        trackAction(actionCategory, 'Click save new owner button', newOwnerId)
      } else {
        trackAction(actionCategory, 'Click clear owner button')
      }

      await save({
        [CommonFieldNames.ownedBy]: newOwnerId
          ? createRef(CollectionNames.Users, newOwnerId)
          : null
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (!isEditorOpen) {
    return (
      <Button
        onClick={() => setIsEditorOpen(true)}
        color="tertiary"
        icon={<AccessibilityIcon />}>
        Change Owner
      </Button>
    )
  }

  return (
    <>
      <p>Enter a username to search for a new owner:</p>
      <SearchForIdForm
        collectionName={CollectionNames.Users}
        fieldAsLabel={UserFieldNames.username}
        onClickWithIdAndDetails={id => onSave(id)}
      />
      <hr />
      <Button onClick={() => onSave(null)}>Clear Existing Owner</Button>
    </>
  )
}
