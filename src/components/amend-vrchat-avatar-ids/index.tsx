import React, { useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'

import useDatabaseSave from '../../hooks/useDatabaseSave'

import { handleError } from '../../error-handling'

import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import Button from '../button'
import TextInput from '../text-input'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import GetVrchatAvatarDetails from '../get-vrchat-avatar-details'
import VrchatAvatarComponent from '../vrchat-avatar'
import { VrchatAvatar } from '../../vrchat'
import { AmendmentFields, CollectionNames } from '../../modules/amendments'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from '../../modules/assets'

export default ({ assetId }: { assetId: string }) => {
  const [isSaving, isSuccess, lastErrorCode, createAmendment] = useDatabaseSave(
    CollectionNames.Amendments
  )
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

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to create amendment (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  const onCreate = async () => {
    try {
      const newAmendment: AmendmentFields = {
        parenttable: AssetsCollectionNames.Assets,
        parent: assetId,
        fields: {
          vrchatclonableavatarids: [newAvatarId],
        } as Partial<Asset>,
        comments,
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
            color="secondary">
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
        minRows={5}
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        fullWidth
      />
      <FormControls>
        <Button
          onClick={onCreate}
          isDisabled={!newAvatarId || !comments}
          icon={<CheckIcon />}
          size={'large'}>
          Submit Amendment For Approval
        </Button>
      </FormControls>
    </div>
  )
}
