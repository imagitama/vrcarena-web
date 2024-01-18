import React, { useEffect, useRef, useState } from 'react'
import CreateIcon from '@material-ui/icons/Create'

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

export default ({
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
  if (!collectionName) {
    throw new Error('Cannot render comment list: no collection name!')
  }
  if (!parentId) {
    throw new Error('Cannot render comment list: no parent ID')
  }

  const [textFieldValue, setTextFieldValue] = useState('')
  const userId = useUserId()
  const [isSaving, isSuccess, isErrored, create, clear] =
    useDataStoreCreate<Comment>(CollectionNames.Comments)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>()

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

  if (isSaving) {
    return <LoadingIndicator message="Adding your comment..." />
  }

  if (isSuccess) {
    return <SuccessMessage>Added your comment successfully</SuccessMessage>
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Error adding your comment
        <br />
        <br />
        <Button onClick={() => clear()}>Try Again</Button>
      </ErrorMessage>
    )
  }

  const onAddCommentBtnClick = async () => {
    try {
      if (onAddClick) {
        onAddClick()
      }

      await create({
        parenttable: collectionName,
        parent: parentId,
        comment: textFieldValue,
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
        <Button onClick={onAddCommentBtnClick}>
          Add{asPrivate ? ' Private' : ''} Comment
        </Button>
      </FormControls>
    </div>
  )
}
