import React, { HTMLProps } from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete, { AutocompleteProps } from '@material-ui/lab/Autocomplete'

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
  onSelectedOption = undefined,
  multiple,
  ...props
}: {
  label: string
  options: AutocompleteOption<any>[]
  filterOptions?: (
    options: AutocompleteOption<any>[],
    searchTerm: string
  ) => AutocompleteOption<any>[]
  onClear?: () => void
  multiple?: boolean
  // for search
  value?: string
  onNewValue?: (newValue: string) => void
  onSelectedOption?: (newOption: AutocompleteOption<any>) => void
} & HTMLProps<HTMLDivElement>) => {
  console.debug(`Autocomplete.render`, {
    value,
    options: options.map(option => `${option.label}.${option.data}`).join(', ')
  })
  return (
    <Autocomplete
      options={options}
      getOptionLabel={option => option.label}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          autoFocus={props.autoFocus}
        />
      )}
      filterOptions={
        filterOptions
          ? (options, state) => filterOptions(options, state.inputValue)
          : undefined
      }
      onChange={(e, value, reason) => {
        switch (reason) {
          case 'clear':
            console.debug(`Autocomplete.clear`)
            if (onClear) {
              onClear()
            }
            break
          case 'select-option':
            console.debug(`Autocomplete.select-option`, value)
            if (onSelectedOption && value) {
              onSelectedOption(value as AutocompleteOption<any>)
            }
            break
          default:
          // ignore
        }
      }}
      // search
      freeSolo={value !== undefined}
      inputValue={value}
      onInputChange={(e, value, reason) => {
        switch (reason) {
          case 'input':
            console.debug(`Autocomplete.onInputChange.input`, value)
            if (onNewValue) {
              onNewValue(value)
            }
            break
          default:
          // ignore
        }
      }}
      openOnFocus
      multiple={multiple}
      // extra
      onKeyDown={props.onKeyDown}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  )
}
