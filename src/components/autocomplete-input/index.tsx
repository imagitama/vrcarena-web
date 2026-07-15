import React, { ChangeEventHandler } from 'react'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import type { AutocompleteRenderInputParams } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import ClearIcon from '@mui/icons-material/Clear'
import { makeStyles } from '@mui/styles'

import { VRCArenaTheme } from '@/themes'

export interface AutocompleteOption<T> {
  label: string
  data: T
  isDisabled?: boolean
}

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  fakeInput: {
    userSelect: 'element',
    background: '#FFF',
    color: '#000',
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    '&:focus': {
      outline: 'none',
    },
    '&:empty:before': {
      content: 'attr(placeholder)',
      pointerEvents: 'none',
      display: 'block',
      opacity: 0.42,
    },
  },
  textFieldWrapper: {
    '& label': {
      paddingTop: '8px !important',
    },
  },
}))

const AutocompleteInput = <TOption,>({
  options,
  label,
  filterOptions,
  onFilteredOptions,
  onClear,
  value,
  onNewValue,
  onSelectedOption,
  multiple = false,
  renderInput,
  className,
  onChange,
  textFieldProps = {},
  ...otherProps
}: {
  options: AutocompleteOption<TOption>[]
  label?: string
  filterOptions?: (
    options: AutocompleteOption<TOption>[],
    searchTerm: string
  ) => AutocompleteOption<TOption>[]
  onFilteredOptions?: (opts: AutocompleteOption<TOption>[]) => void
  onClear?: () => void
  multiple?: boolean
  renderInput?: (props: {
    autocomplete: AutocompleteRenderInputParams
    textField: TextFieldProps
  }) => React.ReactNode
  value?: string
  onNewValue?: (newValue: string) => void
  onSelectedOption?: (newOption: AutocompleteOption<TOption>) => void
  className?: string
  onChange?: ChangeEventHandler
  textFieldProps?: TextFieldProps
  fullWidth?: boolean
}) => {
  return (
    <Autocomplete
      options={options}
      isOptionEqualToValue={(option, value) => option.data === value.data}
      getOptionDisabled={(option) => option.isDisabled === true}
      getOptionLabel={(option: string | AutocompleteOption<TOption>) =>
        typeof option === 'string' ? `Option: ${option}` : option.label
      }
      renderInput={(props) => <TextField placeholder={label} {...props} />}
      filterOptions={
        filterOptions
          ? (options, state) => {
              const filteredOpts = filterOptions(options, state.inputValue)
              if (onFilteredOptions) {
                onFilteredOptions(filteredOpts)
              }
              return filteredOpts
            }
          : // Passing undefined should ignore filtering but it doesnt
            (options) => options
      }
      clearOnEscape
      clearIcon={<ClearIcon />}
      onChange={(e: any, value, reason) => {
        switch (reason) {
          case 'clear':
            // console.debug(`Autocomplete.clear`)
            if (onClear) {
              onClear()
            }
            break
          case 'selectOption':
            // console.debug(`Autocomplete.select-option`, value)
            if (onSelectedOption && value) {
              onSelectedOption(value as AutocompleteOption<any>)
            }
            break
          case 'createOption':
            // console.debug(`Autocomplete.create-option`, value)
            if (onSelectedOption && value) {
              onSelectedOption({
                label: value,
                data: value,
              } as AutocompleteOption<any>)
            }
            break
          default:
          // ignore
        }
      }}
      freeSolo={value !== undefined}
      inputValue={value}
      onInputChange={(e, value, reason) => {
        switch (reason) {
          case 'input':
            // console.debug(`Autocomplete.onInputChange.input`, value)
            if (onNewValue) {
              onNewValue(value)
            }
            if (onChange) {
              // @ts-ignore
              onChange(e)
            }
            break
          default:
          // ignore
        }
      }}
      multiple={multiple}
      className={className}
      {...otherProps}
    />
  )
}

export default AutocompleteInput
