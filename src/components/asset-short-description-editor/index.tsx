import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
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
  onDone = undefined,
  actionCategory,
  overrideSave = undefined,
}: {
  assetId: string | null
  description?: string
  onDone?: () => void
  actionCategory?: string
  overrideSave?: (newDesc: string) => void
}) => {
  const userId = useUserId()
  const [newDescriptionValue, setNewDescriptionValue] = useState(description)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave<Asset>(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Short description saved</SuccessMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save short description</ErrorMessage>
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
