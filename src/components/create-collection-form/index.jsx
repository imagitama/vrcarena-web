import React, { useState } from 'react'
import { CollectionNames, PlaylistsFieldNames } from '../../data-store'
import { handleError } from '../../error-handling'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import Button from '../button'
import TextInput from '../text-input'

export default ({ onDone, onCancel }) => {
  const [title, setTitle] = useState('')
  const [isCreating, isSuccess, isError, create] = useDatabaseSave(
    CollectionNames.Playlists
  )

  const onClickCreate = async () => {
    try {
      if (!title) {
        return
      }

      await create({
        [PlaylistsFieldNames.title]: title,
        [PlaylistsFieldNames.description]: '', // TODO: Allow them to set this?
        [PlaylistsFieldNames.items]: []
      })

      onDone()
    } catch (err) {
      handleError(err)
    }
  }

  const onClickCancel = e => {
    onCancel()
  }

  if (isCreating) {
    return <>Creating collection...</>
  }

  if (isError) {
    return <>Failed to create collection!</>
  }

  if (isSuccess) {
    return null
  }

  return (
    <div>
      <TextInput
        value={title}
        onChange={e => {
          // fix weird bug when rendered inside menu
          e.stopPropagation()

          setTitle(e.target.value)
        }}
        onKeyDown={e => {
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
