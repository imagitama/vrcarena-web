import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import MenuItem from '@material-ui/core/MenuItem'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import TextInput from '../text-input'
import Button from '../button'
import FormControls from '../form-controls'
import { popularCurrencies, PopularCurrency } from '../../currency'
import Select from '../select'
import WarningMessage from '../warning-message'
import Price from '../price'

const useStyles = makeStyles({
  inputWrapper: {
    margin: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  currencySymbol: {
    fontSize: '200%',
    marginRight: '0.5rem'
  }
})

export default ({
  assetId,
  currentPrice,
  currentPriceCurrency,
  onDone,
  onCancel,
  actionCategory,
  overrideSave
}: {
  assetId: string
  currentPrice?: number | null
  currentPriceCurrency?: PopularCurrency
  onDone?: () => void
  onCancel?: () => void
  actionCategory?: string
  overrideSave?: (newPrice: number | null) => void
}) => {
  const [newPriceRaw, setNewPriceRaw] = useState<string | null>(
    currentPrice === undefined || currentPrice === null
      ? null
      : currentPrice.toString()
  )
  const [newPriceCurrency, setNewPriceCurrency] = useState<PopularCurrency>(
    currentPriceCurrency || 'USD'
  )
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      const newPriceToSave = newPriceRaw ? parseFloat(newPriceRaw) : null

      if (overrideSave) {
        overrideSave(newPriceToSave)

        if (onDone) {
          onDone()
        }

        return
      }

      if (actionCategory) {
        trackAction(actionCategory, 'Click save price button')
      }

      await save({
        [AssetFieldNames.price]: newPriceToSave,
        [AssetFieldNames.priceCurrency]: newPriceCurrency
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save price to asset', err)
      handleError(err)
    }
  }

  return (
    <>
      <div className={classes.inputWrapper}>
        <span>
          <Select
            onChange={e =>
              setNewPriceCurrency(e.target.value as PopularCurrency)
            }
            value={newPriceCurrency}>
            {Object.entries(popularCurrencies).map(
              ([currencyCode, currencyName]) => (
                <MenuItem
                  key={currencyCode}
                  value={currencyCode}
                  title={currencyName}>
                  {currencyCode}
                </MenuItem>
              )
            )}
          </Select>
        </span>
        <TextInput
          value={newPriceRaw !== null ? newPriceRaw : ''}
          onChange={e => setNewPriceRaw(e.target.value)}
        />
        <Button onClick={() => setNewPriceRaw(null)} color="default">
          Clear Price
        </Button>
      </div>
      <WarningMessage>
        If automatic syncing with Gumroad is enabled, this price will be
        automatically updated daily. Note the currency is always USD for this to
        work.
      </WarningMessage>
      <br />
      <strong>Preview:</strong>{' '}
      {newPriceRaw === null ? (
        '(no price set)'
      ) : (
        <Price
          price={parseFloat(newPriceRaw)}
          priceCurrency={newPriceCurrency}
        />
      )}
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
          {onCancel ? (
            <Button onClick={() => onCancel()} color="default">
              Cancel
            </Button>
          ) : null}
        </FormControls>
      )}
    </>
  )
}
