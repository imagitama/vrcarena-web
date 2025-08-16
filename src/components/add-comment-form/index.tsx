import React, { useEffect, useRef, useState } from 'react'
import CreateIcon from '@mui/icons-material/Create'

import useDataStoreCreate from '../../hooks/useDataStoreCreate'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import { CollectionNames, Comment } from '../../modules/comments'

import FormControls from '../form-controls'
import MentionsInput from '../mentions-input'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import useIsBanned from '../../hooks/useIsBanned'
import NoPermissionMessage from '../no-permission-message'
import useAccountVerification from '../../hooks/useAccountVerification'

const AddCommentForm = ({
  collectionName,
  parentId,
  onAddClick = undefined,
  onDone = undefined,
  asPrivate = false,
}: {
  collectionName: string
  parentId: string
  onAddClick?: () => void
  onDone?: () => void
  asPrivate?: boolean
}) => {
  const [textFieldValue, setTextFieldValue] = useState('')
  const userId = useUserId()
  const [isSaving, isSuccess, lastErrorCode, create, clear] =
    useDataStoreCreate<Comment>(CollectionNames.Comments)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>()
  const isVerified = useAccountVerification()

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    },
    []
  )

  if (!userId) {
    return (
      <FormControls>
        <Button size="large" icon={<CreateIcon />} isDisabled>
          Log in to comment
        </Button>
      </FormControls>
    )
  }

  if (useIsBanned() || !isVerified) {
    return <NoPermissionMessage />
  }

  if (isSaving) {
    return <LoadingIndicator message="Adding your comment..." />
  }

  if (isSuccess) {
    return <SuccessMessage>Added your comment successfully</SuccessMessage>
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage onRetry={clear}>
        Error adding your comment (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  const onAddCommentBtnClick = async () => {
    try {
      if (onAddClick) {
        onAddClick()
      }

      if (!textFieldValue.trim()) {
        console.warn('Cannot add comment without a message')
        return
      }

      await create({
        parenttable: collectionName,
        parent: parentId,
        comment: textFieldValue.trim(),
        isprivate: asPrivate,
      })

      setTextFieldValue('')

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to add comment', err)
      handleError(err)
    }
  }

  return (
    <div>
      <MentionsInput
        value={textFieldValue}
        onChange={(newVal) => setTextFieldValue(newVal)}
        isDisabled={isSaving}
      />
      <FormControls extraTopMargin>
        <Button
          onClick={onAddCommentBtnClick}
          isDisabled={!textFieldValue.trim()}>
          Add{asPrivate ? ' Private' : ''} Comment
        </Button>
      </FormControls>
    </div>
  )
}

export default AddCommentForm
