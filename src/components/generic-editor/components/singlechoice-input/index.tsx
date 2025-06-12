import React, { Fragment } from 'react'
import CheckboxInput from '../../../checkbox-input'
import { Option } from '../../../../editable-fields'

export default ({
  onChange,
  value = null,
  options,
}: {
  value: string | null
  onChange: (newVal: string | null) => void
  options: Option[]
}) => (
  <>
    {options.map(({ value: optionValue, label }) => {
      const isChecked = value === optionValue
      return (
        <CheckboxInput
          key={optionValue}
          label={label}
          onChange={() => onChange(optionValue)}
          value={isChecked}
        />
      )
    })}
  </>
)
