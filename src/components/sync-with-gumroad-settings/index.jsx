import React, { useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'
import { makeStyles } from '@material-ui/core/styles'

import {
  AssetFieldNames,
  CollectionNames,
  AssetGumroadFields
} from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
// import * as routes from '../../routes'

import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import Checkbox from '../checkbox-input'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import FormControls from '../form-controls'

const actionCategory = 'AssetOverviewEditor'

const useStyles = makeStyles({
  fields: {
    marginLeft: '1rem'
  }
})

export default ({
  assetId,
  isEnabled = false,
  settings = null,
  onDone = null,
  overrideSave = null
}) => {
  const userId = useUserId()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [newGumroadSettings, setNewGumroadSettings] = useState({
    [AssetGumroadFields.sync]: isEnabled,
    [AssetGumroadFields.fields]:
      settings && settings[AssetGumroadFields.fields]
        ? settings[AssetGumroadFields.fields]
        : {}
  })
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save gumroad settings button')

      if (overrideSave) {
        overrideSave(newGumroadSettings)
        onDone()
        return
      }

      await save({
        [AssetFieldNames.gumroad]: newGumroadSettings
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset', err)
      handleError(err)
    }
  }

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save asset</ErrorMessage>
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Settings saved successfully!</SuccessMessage>
  }

  const setField = (fieldName, newVal) => {
    setNewGumroadSettings(currentVal => ({
      ...currentVal,
      [AssetGumroadFields.fields]: {
        ...currentVal[AssetGumroadFields.fields],
        [fieldName]: newVal
      }
    }))
  }

  return (
    <>
      <Checkbox
        label="Automatically sync with Gumroad"
        value={newGumroadSettings[AssetGumroadFields.sync]}
        onChange={newVal => {
          setNewGumroadSettings(currentVal => ({
            ...currentVal,
            [AssetGumroadFields.sync]: newVal
          }))
        }}
      />
      {newGumroadSettings[AssetGumroadFields.sync] && (
        <div>
          <p>
            Select the field you want to automatically sync (price is always
            synced!):
          </p>
          <div className={classes.fields}>
            <Checkbox
              value={
                newGumroadSettings[AssetGumroadFields.fields][
                  AssetFieldNames.title
                ] || false
              }
              onChange={newVal => setField(AssetFieldNames.title, newVal)}
              label="Title"
            />
            <br />
            <Checkbox
              value={
                newGumroadSettings[AssetGumroadFields.fields][
                  AssetFieldNames.description
                ] || false
              }
              onChange={newVal => setField(AssetFieldNames.description, newVal)}
              label="Description"
            />
            <p>
              <strong>Note:</strong> Description always has quotation symbols
              around it
            </p>
          </div>
        </div>
      )}
      <FormControls>
        <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
    </>
  )
}
