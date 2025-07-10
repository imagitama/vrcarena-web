import React, { useState } from 'react'
import { handleError } from '../../error-handling'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import Button from '../button'
import TextInput from '../text-input'
import { CollectionNames, Collection } from '../../modules/collections'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'

const CreateCollectionForm = ({
  onDone,
  onCancel,
}: {
  onDone: () => void
  onCancel: () => void
}) => {
  const [title, setTitle] = useState('')
  const [isCreating, isSuccess, lastErrorCode, create] =
    useDataStoreCreate<Collection>(CollectionNames.Collections)

  const onClickCreate = async () => {
    try {
      if (!title) {
        return
      }

      await create({
        title: title,
        description: '', // TODO: Allow them to set this?
        items: [],
      })

      onDone()
    } catch (err) {
      handleError(err)
    }
  }

  const onClickCancel = () => {
    onCancel()
  }

  if (isCreating) {
    return <>Creating collection...</>
  }

  if (lastErrorCode !== null) {
    return <>Failed to create collection (code {lastErrorCode})</>
  }

  if (isSuccess) {
    return null
  }

  return (
    <div>
      <TextInput
        value={title}
        onChange={(e) => {
          // fix weird bug when rendered inside menu
          e.stopPropagation()

          setTitle(e.target.value)
        }}
        onKeyDown={(e) => {
          // fix weird bug when rendered inside menu
          e.stopPropagation()

          if (e.key == 'Enter') {
            onClickCreate()
          }
        }}
        label="Name"
        size="small"
      />{' '}
      <br />
      <Button onClick={onClickCreate} size="small">
        Create
      </Button>{' '}
      <Button onClick={onClickCancel} size="small">
        Cancel
      </Button>
    </div>
  )
}

export default CreateCollectionForm
