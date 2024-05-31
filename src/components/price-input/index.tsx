import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'

import TextInput from '../text-input'
import Button from '../button'
import { popularCurrencies, PopularCurrency } from '../../currency'
import Select from '../select'
import Price from '../price'

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

const PriceInput = ({
  price,
  priceCurrency,
  onChange,
}: {
  price: number | null
  priceCurrency: PopularCurrency
  onChange: (
    newUserPrice: number | null,
    newPriceCurrency: PopularCurrency
  ) => void
}) => {
  const [userPrice, setUserPrice] = useState(price || '')
  const classes = useStyles()

  return (
    <>
      <div className={classes.inputWrapper}>
        <span>
          <Select
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
        <TextInput
          value={userPrice}
          onChange={(e) => {
            setUserPrice(e.target.value.trim())
            const newPrice = parseFloat(e.target.value.trim())
            onChange(newPrice > 0 ? newPrice : null, priceCurrency)
          }}
        />
        <Button onClick={() => onChange(null, priceCurrency)} color="default">
          Clear Price
        </Button>
      </div>
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
  )
}

export default PriceInput
