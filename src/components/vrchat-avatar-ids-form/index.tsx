import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import SaveIcon from '@material-ui/icons/Save'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import FormControls from '../form-controls'
import Button from '../button'
import GetVrchatAvatarDetails from '../get-vrchat-avatar-details'
import { Asset, CollectionNames } from '../../modules/assets'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'

const analyticsCategoryName = 'ViewAssetEditor'

const useStyles = makeStyles({
  root: {
    padding: '0.5rem',
  },
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
  form: {
    padding: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
})

export default ({
  assetId,
  avatarIds = [],
  onDone,
  overrideSave = undefined,
}: {
  assetId: string | null
  avatarIds?: string[]
  onDone?: () => void
  overrideSave?: (newIds: string[]) => void
}) => {
  const userId = useUserId()
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave<Asset>(
    CollectionNames.Assets,
    assetId
  )
  const [newAvatarIds, setNewAvatarIds] = useState<string[]>(avatarIds || [])
  const classes = useStyles()

  if (!userId) {
    return <ErrorMessage>You are not logged in</ErrorMessage>
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isSuccess) {
    return <SuccessMessage>Asset saved successfully</SuccessMessage>
  }

  if (isFailed) {
    return <ErrorMessage>Error saving asset</ErrorMessage>
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
    setNewAvatarIds((currentAvatarIds) => currentAvatarIds.concat([avatarId]))
  const removeAvatarId = (avatarId: string) =>
    setNewAvatarIds((currentAvatarIds) =>
      currentAvatarIds.filter((id) => id !== avatarId)
    )

  return (
    <div className={classes.root}>
      <div className={classes.form}>
        <GetVrchatAvatarDetails
          onDone={(avatarId, avatarData, restart) => {
            addAvatarId(avatarId)
            restart()
          }}
        />
      </div>
      {newAvatarIds.length ? (
        <div className={classes.results}>
          {newAvatarIds.map((avatarId) => (
            <div key={avatarId} className={classes.result}>
              {avatarId}{' '}
              <Button
                onClick={() => removeAvatarId(avatarId)}
                color="default"
                size="small">
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className={classes.message}>No avatar IDs have been set yet</div>
      )}
      <FormControls>
        <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
    </div>
  )
}
