import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import useUserId from '../../hooks/useUserId'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { Asset, CollectionNames } from '../../modules/assets'

import Paper from '../paper'
import Button from '../button'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'

const useStyles = makeStyles({
  input: {
    width: '100%',
    marginBottom: '1rem',
  },
  controls: {
    textAlign: 'center',
  },
})

export default ({
  assetId,
  description = '',
  onDone,
  actionCategory,
  overrideSave,
}: {
  assetId: string | null
  description?: string
  onDone?: () => void
  actionCategory?: string
  overrideSave?: (newDesc: string) => void
}) => {
  const [newDescriptionValue, setNewDescriptionValue] =
    useState<string>(description)
  const [isSaving, isSaveSuccess, lastErrorCode, save] =
    useDataStoreEdit<Asset>(CollectionNames.Assets, assetId || false)
  const classes = useStyles()

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Short description saved</SuccessMessage>
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to save short description (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  const onSaveBtnClick = async () => {
    try {
      if (!newDescriptionValue) {
        return
      }

      if (overrideSave) {
        overrideSave(newDescriptionValue)

        if (onDone) {
          onDone()
        }
        return
      }

      if (actionCategory) {
        trackAction(actionCategory, 'Click save short description button')
      }

      await save({
        shortdescription: newDescriptionValue,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset short description', err)
      handleError(err)
    }
  }

  return (
    <Paper>
      <TextField
        value={newDescriptionValue}
        onChange={(e) => {
          setNewDescriptionValue(e.target.value)
        }}
        multiline
        minRows={2}
        className={classes.input}
      />
      <div className={classes.controls}>
        <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
          Save
        </Button>
      </div>
    </Paper>
  )
}
