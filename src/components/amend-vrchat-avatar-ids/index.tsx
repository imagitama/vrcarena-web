import React, { useState } from 'react'

import {
  CollectionNames as OldCollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import { handleError } from '../../error-handling'

import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import Button from '../button'
import TextInput from '../text-input'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import GetVrchatAvatarDetails from '../get-vrchat-avatar-details'
import VrchatAvatarComponent, { VrchatAvatar } from '../vrchat-avatar'
import { CollectionNames } from '../../data-store'
import { AmendmentFields } from '../../modules/amendments'

export default ({ assetId }: { assetId: string }) => {
  const [
    isSaving,
    isSuccess,
    isErroredSaving,
    createAmendment
  ] = useDatabaseSave(CollectionNames.Amendments)
  const [newAvatarId, setNewAvatarId] = useState('')
  const [newAvatarData, setNewAvatarData] = useState<VrchatAvatar | undefined>()
  const [comments, setComments] = useState('')

  if (isSaving) {
    return <LoadingIndicator message="Creating amendment..." />
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        Asset amendment created successfully!
        <br />
        <br />
        Our editors have been notified of your pending amendment and will try to
        review it ASAP.
        <br />
        <br />
        Please ask in our Discord server if it has been several days without
        action.
      </SuccessMessage>
    )
  }

  if (isErroredSaving) {
    return <ErrorMessage>Failed to create amendment</ErrorMessage>
  }

  const onCreate = async () => {
    try {
      const newAmendment: AmendmentFields = {
        parenttable: OldCollectionNames.Assets,
        parent: assetId,
        fields: {
          [AssetFieldNames.vrchatClonableAvatarIds]: [newAvatarId]
        },
        comments
      }

      await createAmendment(newAmendment)
    } catch (err) {
      console.error('Failed to save asset amendment', err)
      handleError(err)
    }
  }

  return (
    <div>
      {newAvatarId ? (
        <>
          <VrchatAvatarComponent
            avatarId={newAvatarData ? newAvatarData.id : ''}
            avatarData={newAvatarData}
          />
          <Button
            onClick={() => {
              setNewAvatarId('')
              setNewAvatarData(undefined)
            }}
            color="default">
            Try Again
          </Button>
        </>
      ) : (
        <GetVrchatAvatarDetails
          onDone={(avatarId: string, avatarData: VrchatAvatar) => {
            setNewAvatarId(avatarId)
            setNewAvatarData(avatarData)
          }}
        />
      )}
      <p>
        Where did you find this avatar? Who created it? Is it the official
        avatar? Explain:
      </p>
      <TextInput
        multiline
        rows={5}
        value={comments}
        onChange={e => setComments(e.target.value)}
        fullWidth
      />
      <FormControls>
        <Button onClick={onCreate} isDisabled={!newAvatarId || !comments}>
          Create Amendment
        </Button>
      </FormControls>
    </div>
  )
}
