import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import FormControls from '../form-controls'
import Button from '../button'
import GetVrchatAvatarDetails from '../get-vrchat-avatar-details'
import { Asset, AssetFields, CollectionNames } from '../../modules/assets'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import {
  AssetEditorProps,
  ControlledEditorProps,
  UncontrolledEditorProps,
} from '@/generic-forms'
import NoResultsMessage from '../no-results-message'

const analyticsCategoryName = 'ViewAssetEditor'

const useStyles = makeStyles({
  root: {},
  label: {
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  },
  inputWrapper: {
    display: 'flex',
  },
  input: {
    flex: 1,
    marginRight: '0.5rem',
  },
  message: {
    textAlign: 'center',
    padding: '1rem 0',
    fontStyle: 'italic',
  },
  results: {
    marginTop: '1rem',
  },
  result: {
    padding: '0.5rem',
    '&:nth-child(even)': {
      background: 'rgba(255, 255, 255, 0.1)',
    },
  },
  avatarOutput: {
    padding: '0.5rem',
  },
})

type VrchatClonableAvatarIds = AssetFields['vrchatclonableavatarids']

const VrchatAvatarIdsForm = ({
  assetId,
  overrideSave,
  onDone,
  ...props
}: AssetEditorProps<VrchatClonableAvatarIds>) => {
  const userId = useUserId()
  const [isSaving, isSuccess, lastErrorCode, save] = useDataStoreEdit<Asset>(
    CollectionNames.Assets,
    assetId || false
  )
  const [storedAvatarIds, setStoredAvatarIds] =
    useState<VrchatClonableAvatarIds>(
      (props as UncontrolledEditorProps<VrchatClonableAvatarIds>)
        .initialValue || []
    )
  const classes = useStyles()

  const newAvatarIds = (props as ControlledEditorProps<VrchatClonableAvatarIds>)
    .onChange
    ? (props as ControlledEditorProps<VrchatClonableAvatarIds>).value
    : storedAvatarIds

  const setNewAvatarIds = (newIds: string[]) =>
    (props as ControlledEditorProps<VrchatClonableAvatarIds>).onChange
      ? (props as ControlledEditorProps<VrchatClonableAvatarIds>).onChange(
          newIds
        )
      : setStoredAvatarIds(newIds)

  if (!userId) {
    return <ErrorMessage>You are not logged in</ErrorMessage>
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isSuccess) {
    return <SuccessMessage>Asset saved successfully</SuccessMessage>
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Error saving asset (code {lastErrorCode})</ErrorMessage>
    )
  }

  const onSaveBtnClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(newAvatarIds)

        if (onDone) {
          onDone()
        }
        return
      }

      trackAction(
        analyticsCategoryName,
        'Click save clonable VRChat avatar IDs button',
        assetId
      )

      await save({
        vrchatclonableavatarids: newAvatarIds,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const addAvatarId = (avatarId: string) =>
    setNewAvatarIds(newAvatarIds.concat([avatarId]))
  const removeAvatarId = (avatarId: string) =>
    setNewAvatarIds(newAvatarIds.filter((id) => id !== avatarId))

  return (
    <div className={classes.root}>
      <GetVrchatAvatarDetails
        onDone={(avatarId, avatarData, restart) => {
          addAvatarId(avatarId)
          restart()
        }}
      />
      {newAvatarIds.length ? (
        <div className={classes.results}>
          {newAvatarIds.map((avatarId) => (
            <div key={avatarId} className={classes.result}>
              {avatarId}{' '}
              <Button
                onClick={() => removeAvatarId(avatarId)}
                color="secondary"
                size="small">
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <NoResultsMessage>No avatar IDs have been set yet</NoResultsMessage>
      )}
      {(props as ControlledEditorProps<VrchatClonableAvatarIds>)
        .onChange ? null : (
        <FormControls>
          <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
            Save
          </Button>
        </FormControls>
      )}
    </div>
  )
}

export default VrchatAvatarIdsForm
