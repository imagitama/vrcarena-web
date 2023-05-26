import React from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'

export interface AutocompleteOption<T> {
  label: string
  data: T
}

export default ({
  label,
  options,
  filterOptions = undefined,
  onClear = undefined,
  // for search
  value = undefined,
  onNewValue = undefined,
  onSelectedOption = undefined
}: {
  label: string
  options: AutocompleteOption<any>[]
  filterOptions?: (
    options: AutocompleteOption<any>[],
    searchTerm: string
  ) => AutocompleteOption<any>[]
  onClear?: () => void
  // for search
  value?: string
  onNewValue?: (newValue: string) => void
  onSelectedOption?: (newOption: AutocompleteOption<any>) => void
}) => {
  return (
    <Autocomplete
      id="combo-box-demo"
      options={options}
      getOptionLabel={option => option.label}
      renderInput={params => (
        <TextField {...params} label={label} variant="outlined" />
      )}
      filterOptions={
        filterOptions
          ? (options, state) => filterOptions(options, state.inputValue)
          : undefined
      }
      onChange={(e, value, reason) =>
        reason === 'clear' && onClear
          ? onClear()
          : onSelectedOption && value
          ? onSelectedOption(value as AutocompleteOption<any>)
          : undefined
      }
      // search
      freeSolo={value !== undefined}
      inputValue={value}
      onInputChange={
        onNewValue ? (e, newValue) => onNewValue(newValue) : undefined
      }
    />
  )
}
