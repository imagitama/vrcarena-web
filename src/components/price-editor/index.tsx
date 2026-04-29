import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import { handleError } from '@/error-handling'
import { trackAction } from '@/analytics'
import { PopularCurrency } from '@/currency'
import { Asset, CollectionNames } from '@/modules/assets'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'

import Button from '@/components/button'
import FormControls from '@/components/form-controls'
import WarningMessage from '@/components/warning-message'
import LoadingIndicator from '@/components/loading-indicator'
import SuccessMessage from '@/components/success-message'
import ErrorMessage from '@/components/error-message'
import PriceAndCurrencyInput from '@/components/price-and-currency-input'

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
  currentPriceCurrency?: PopularCurrency | null
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
  const [isSaving, isSaveSuccess, lastErrorCode, save] =
    useDataStoreEdit<Asset>(CollectionNames.Assets, assetId || false)

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
        price: newPrice,
        pricecurrency: newPriceCurrency,
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
        this price will be automatically updated regularly.
      </WarningMessage>
      <PriceAndCurrencyInput
        price={newPrice}
        priceCurrency={newPriceCurrency}
        onChange={(newPrice, newPriceCurrency) => {
          setNewPriceRaw(newPrice)
          setNewPriceCurrency(newPriceCurrency)
        }}
      />
      {isSaving ? (
        <LoadingIndicator message="Saving..." />
      ) : isSaveSuccess ? (
        <SuccessMessage>Price saved successfully</SuccessMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage>Failed to save price (code {lastErrorCode})</ErrorMessage>
      ) : null}

      <FormControls>
        <Button
          onClick={onSaveBtnClick}
          icon={<SaveIcon />}
          isDisabled={isSaving}>
          Save
        </Button>{' '}
        {onCancel ? (
          <Button
            onClick={() => onCancel()}
            color="secondary"
            isDisabled={isSaving}>
            Cancel
          </Button>
        ) : null}
      </FormControls>
    </>
  )
}

export default PriceEditor
