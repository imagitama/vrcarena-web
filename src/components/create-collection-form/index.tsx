import React, { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import { handleError } from '../../error-handling'
import Button from '../button'
import TextInput from '../text-input'
import { CollectionNames, Collection } from '../../modules/collections'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'
import CheckboxInput from '../checkbox-input'
import FormControls from '../form-controls'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'

const CreateCollectionForm = ({
  onDone,
  assetId,
}: {
  onDone: (autoAddedAsset: boolean) => void
  assetId: string
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [shouldAutoAddAsset, setShouldAutoAddAsset] = useState(true)
  const [isCreating, isSuccess, lastErrorCode, create, clear] =
    useDataStoreCreate<Collection>(CollectionNames.Collections)

  const onClickCreate = async () => {
    try {
      if (!title) {
        console.warn('no title')
        return
      }

      await create({
        title,
        description,
        items: shouldAutoAddAsset ? [{ asset: assetId }] : [],
      })

      onDone(shouldAutoAddAsset)
    } catch (err) {
      handleError(err)
    }
  }

  if (isCreating) {
    return <LoadingIndicator message="Creating collection..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage noMargin>
        Failed to create collection (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (isSuccess) {
    return (
      <SuccessMessage onOkay={!shouldAutoAddAsset ? clear : undefined} noMargin>
        Collection created successfully
        {shouldAutoAddAsset ? ' (and asset added to it). Closing...' : ''}
      </SuccessMessage>
    )
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
        fullWidth
      />
      <br />
      <TextInput
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        label="Description (optional)"
        maxRows={2}
        fullWidth
      />
      <CheckboxInput
        value={shouldAutoAddAsset}
        onChange={() => setShouldAutoAddAsset((currentVal) => !currentVal)}
        label="Add this asset to the collection"
      />
      <FormControls>
        <Button onClick={onClickCreate} icon={<SaveIcon />}>
          Create
        </Button>
      </FormControls>
    </div>
  )
}

export default CreateCollectionForm
