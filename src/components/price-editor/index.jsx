import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'

import TextInput from '../text-input'
import Button from '../button'
import FormControls from '../form-controls'

const useStyles = makeStyles(theme => ({
  inputWrapper: {
    margin: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dollarSign: {
    fontSize: '200%',
    marginRight: '0.5rem'
  }
}))

export default ({
  assetId,
  currentPriceUsd,
  onDone,
  onCancel,
  actionCategory,
  overrideSave = null
}) => {
  const userId = useUserId()
  const [newPriceUsd, setNewPriceUsd] = useState(currentPriceUsd)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(parseFloat(newPriceUsd))
        onDone()
        return
      }

      trackAction(actionCategory, 'Click save price button')

      if (newPriceUsd === currentPriceUsd) {
        console.warn(
          'Cannot save the asset price: new price is the same as the original'
        )
        onDone()
        return
      }

      await save({
        [AssetFieldNames.priceUsd]: parseFloat(newPriceUsd)
      })

      onDone()
    } catch (err) {
      console.error('Failed to save asset', err)
      handleError(err)
    }
  }

  return (
    <>
      Enter a price in USD with up to 2 decimal places (eg. 10.32 for US$10.32):
      <div className={classes.inputWrapper}>
        <span className={classes.dollarSign}>$</span>
        <TextInput
          value={newPriceUsd}
          onChange={e => setNewPriceUsd(e.target.value)}
        />
      </div>
      <strong>Note: </strong> If syncing with Gumroad is enabled then this price
      will automatically update daily
      <br />
      {isSaving ? (
        'Saving...'
      ) : isSaveSuccess ? (
        'Success!'
      ) : isSaveError ? (
        'Error'
      ) : (
        <FormControls>
          <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
            Save
          </Button>{' '}
          <Button onClick={() => onCancel()} color="default">
            Cancel
          </Button>
        </FormControls>
      )}
    </>
  )
}
