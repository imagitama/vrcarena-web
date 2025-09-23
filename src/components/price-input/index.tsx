import React, { useState } from 'react'
import ClearIcon from '@mui/icons-material/Clear'

import TextInput from '../text-input'
import Button from '../button'
import { PopularCurrency } from '@/currency'
import { InputAdornment } from '@mui/material'

const PriceInput = ({
  value,
  priceCurrency,
  onChange,
}: {
  value: number | null
  priceCurrency?: PopularCurrency | null
  onChange: (newUserPrice: number | null) => void
}) => {
  console.log('VALUE', { value })
  const [userInput, setUserInput] = useState(value !== null ? value : '')
  return (
    <TextInput
      InputProps={
        priceCurrency
          ? {
              startAdornment: (
                <InputAdornment position="start">
                  {priceCurrency}
                </InputAdornment>
              ),
            }
          : undefined
      }
      value={userInput}
      onChange={(e) => {
        const newUserInput = e.target.value
        setUserInput(newUserInput)
        const newPrice = parseFloat(e.target.value.trim())
        if (!isNaN(newPrice)) {
          onChange(newPrice)
        }
      }}
      button={
        <Button
          onClick={() => {
            onChange(null)
            setUserInput('')
          }}
          color="secondary"
          icon={<ClearIcon />}>
          Clear
        </Button>
      }
    />
  )
}

export default PriceInput
