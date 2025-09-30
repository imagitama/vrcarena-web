import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import MenuItem from '@mui/material/MenuItem'

import TextInput from '../text-input'
import Button from '../button'
import { popularCurrencies, PopularCurrency } from '../../currency'
import Select from '../select'
import Price from '../price'
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

const PriceAndCurrencyInput = ({
  price,
  priceCurrency,
  onChange,
  showPreview = true,
}: {
  price: number | null
  priceCurrency: PopularCurrency
  onChange: (
    newUserPrice: number | null,
    newPriceCurrency: PopularCurrency
  ) => void
  showPreview?: boolean
}) => {
  const classes = useStyles()

  return (
    <>
      <div className={classes.inputWrapper}>
        <span>
          <Select
            label="Currency"
            onChange={(e) => onChange(price, e.target.value as PopularCurrency)}
            value={priceCurrency}>
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
        <PriceInput
          value={price}
          onChange={(newPrice) => onChange(newPrice, priceCurrency)}
          allowClear={false}
        />
        <Button onClick={() => onChange(null, priceCurrency)} color="secondary">
          Clear Price
        </Button>
      </div>
      {showPreview ? (
        <>
          <br />
          <strong>Preview:</strong>{' '}
          {price === null ? (
            '(no price set)'
          ) : priceCurrency === null ? (
            '(no currency set)'
          ) : (
            <Price price={price} priceCurrency={priceCurrency} />
          )}
          <br />
          <br />
        </>
      ) : null}
    </>
  )
}

export default PriceAndCurrencyInput
