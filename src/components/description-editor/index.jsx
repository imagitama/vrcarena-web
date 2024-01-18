import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
// import Markdown from '../markdown'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import Checkbox from '@material-ui/core/Checkbox'

import Paper from '../paper'
import Button from '../button'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Markdown from '../markdown'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import {
  addQuotesToDescription,
  removeQuotesFromDescription,
} from '../../utils/formatting'
import FormControls from '../form-controls'

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
  onChange = null,
  onDone = null,
  onCancel = null,
  actionCategory,
  overrideSave = null,
}) => {
  const userId = useUserId()
  const [newDescriptionValue, setNewDescriptionValue] = useState(description)
  const [isUsingQuotes, setIsUsingQuotes] = useState(false)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
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

      trackAction(actionCategory, 'Click save description button')

      await save({
        [AssetFieldNames.description]: newDescriptionValue,
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
          rows={15}
          className={classes.input}
        />
        <Checkbox
          checked={isUsingQuotes}
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
        />{' '}
        Add quote symbols to description (use if you copy the description from a
        third party like Gumroad)
        <FormControls>
          <Button onClick={() => onSaveBtnClick()} icon={<SaveIcon />}>
            Save
          </Button>{' '}
          {onCancel && (
            <Button onClick={() => onCancel()} color="default">
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
