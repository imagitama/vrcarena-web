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
import WarningMessage from '../warning-message'
import PriceInput from '../price-input'

const useStyles = makeStyles({
  inputWrapper: {
    margin: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: '200%',
    marginRight: '0.5rem',
  },
})

const PriceEditor = ({
  assetId,
  currentPrice,
  currentPriceCurrency,
  onDone,
  onCancel,
  actionCategory,
  overrideSave,
}: {
  assetId: string | null
  currentPrice?: number | null
  currentPriceCurrency?: PopularCurrency
  onDone?: () => void
  onCancel?: () => void
  actionCategory?: string
  overrideSave?: (newPrice: number | null, newPriceCurrency: string) => void
  // extra sources editor
  price?: number | null
  priceCurrency?: number | null
  onChange?: (
    newPrice: number | null,
    newPriceCurrency: PopularCurrency | null
  ) => void
}) => {
  const [newPrice, setNewPriceRaw] = useState<number | null>(
    currentPrice === undefined || currentPrice === null ? null : currentPrice
  )
  const [newPriceCurrency, setNewPriceCurrency] = useState<PopularCurrency>(
    currentPriceCurrency || 'USD'
  )
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    assetId ? CollectionNames.Assets : false,
    assetId
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(newPrice, newPriceCurrency)

        if (onDone) {
          onDone()
        }

        return
      }

      if (actionCategory) {
        trackAction(actionCategory, 'Click save price button')
      }

      await save({
        [AssetFieldNames.price]: newPrice,
        [AssetFieldNames.priceCurrency]: newPriceCurrency,
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
      <WarningMessage>
        If automatic syncing with Gumroad is enabled (and the currency is USD)
        this price will be automatically updated daily.
      </WarningMessage>
      <PriceInput
        price={newPrice}
        priceCurrency={newPriceCurrency}
        onChange={(newPrice, newPriceCurrency) => {
          setNewPriceRaw(newPrice)
          setNewPriceCurrency(newPriceCurrency)
        }}
      />
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

export default PriceEditor
