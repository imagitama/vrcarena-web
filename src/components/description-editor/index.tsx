import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'
import Checkbox from '@mui/material/Checkbox'

import Paper from '../paper'
import Button from '../button'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Markdown from '../markdown'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import {
  addQuotesToDescription,
  removeQuotesFromDescription,
} from '../../utils/formatting'
import FormControls from '../form-controls'
import { Asset, CollectionNames } from '../../modules/assets'
import CheckboxInput from '../checkbox-input'

const useStyles = makeStyles({
  input: {
    width: '100%',
    marginBottom: '1rem',
  },
  controls: {
    textAlign: 'center',
  },
})

const DescriptionEditor = ({
  assetId,
  description = '',
  onChange = undefined,
  onDone = undefined,
  onCancel = undefined,
  actionCategory,
  overrideSave = undefined,
}: {
  assetId: string | null
  description: string
  onChange?: (newDesc: string) => void
  onDone?: () => void
  onCancel?: () => void
  actionCategory?: string
  overrideSave?: (newDesc: string) => void
}) => {
  const [newDescriptionValue, setNewDescriptionValue] = useState(description)
  const [isUsingQuotes, setIsUsingQuotes] = useState(false)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave<Asset>(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Description saved</SuccessMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save description</ErrorMessage>
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
        trackAction(actionCategory, 'Click save description button')
      }

      await save({
        description: newDescriptionValue,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset description', err)
      handleError(err)
    }
  }

  return (
    <>
      <Paper>
        <TextField
          value={newDescriptionValue}
          onChange={(e) => {
            setNewDescriptionValue(e.target.value)

            if (onChange) {
              onChange(e.target.value)
            }
          }}
          multiline
          minRows={15}
          className={classes.input}
        />
        <CheckboxInput
          value={isUsingQuotes}
          onClick={() => {
            setNewDescriptionValue((currentVal) => {
              const newDescription = isUsingQuotes
                ? removeQuotesFromDescription(currentVal)
                : addQuotesToDescription(currentVal)

              if (onChange) {
                onChange(newDescription)
              }
              return newDescription
            })

            setIsUsingQuotes(!isUsingQuotes)
          }}
          label="Add quote symbols to description (use if you copy the description from a third party like Gumroad)"
        />{' '}
        <FormControls>
          <Button onClick={() => onSaveBtnClick()} icon={<SaveIcon />}>
            Save
          </Button>{' '}
          {onCancel && (
            <Button onClick={() => onCancel()} color="secondary">
              Cancel
            </Button>
          )}
        </FormControls>
      </Paper>
      <Markdown source={newDescriptionValue} replaceImagesWithButtons />
    </>
  )
}

export default DescriptionEditor
