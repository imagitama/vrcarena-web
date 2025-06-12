import React, { ChangeEventHandler } from 'react'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import Autocomplete from '@mui/lab/Autocomplete'
import ClearIcon from '@mui/icons-material/Clear'
import { makeStyles } from '@mui/styles'
import type { AutocompleteRenderInputParams } from '@mui/material'
import { VRCArenaTheme } from '../../themes'

export interface AutocompleteOption<T> {
  label: string
  data: T
  isDisabled?: boolean
}

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  divInput: {
    // wordWrap: 'anywhere',
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

const MyTextField = ({
  params,
  textFieldProps,
  useDiv,
}: {
  params: AutocompleteRenderInputParams
  textFieldProps: TextFieldProps
  useDiv: boolean
}) => {
  const classes = useStyles()

  if (textFieldProps.inputRef) {
    // @ts-ignore
    textFieldProps.inputRef.current = params.inputProps.ref.current
  }

  return (
    <div ref={params.InputProps.ref} className={classes.textFieldWrapper}>
      {useDiv ? (
        <div
          // @ts-ignore
          ref={params.inputProps.ref}
          // @ts-ignore
          className={`${classes.divInput} ${params.inputProps.className} ${textFieldProps.className}`}
          contentEditable
          onKeyDown={textFieldProps.onKeyDown}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          onInput={(event) => {
            const target = event.target

            // @ts-ignore
            target.value = event.target.innerText.trim()

            params.inputProps.onChange!({
              // @ts-ignore
              target,
            })
          }}
        />
      ) : (
        // @ts-ignore
        <TextField
          {...textFieldProps}
          {...params.inputProps}
          // @ts-ignore
          ref={params.inputProps.ref}
          variant="outlined"
        />
      )}
    </div>
  )
}

const AutocompleteInput = <TOption,>({
  useDiv,
  label,
  options,
  filterOptions = undefined,
  onClear = undefined,
  value = undefined,
  onNewValue = undefined,
  onSelectedOption = undefined,
  multiple = false,
  renderInput,
  className,
  onChange,
  textFieldProps = {},
  ...autocompleteProps
}: {
  useDiv?: boolean
  label?: string
  options: AutocompleteOption<TOption>[]
  filterOptions?: (
    options: AutocompleteOption<TOption>[],
    searchTerm: string
  ) => AutocompleteOption<TOption>[]
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
  const classes = useStyles()
  return (
    <Autocomplete
      options={options}
      getOptionDisabled={(option) => option.isDisabled === true}
      getOptionLabel={(option: string | AutocompleteOption<TOption>) =>
        typeof option === 'string' ? `Option: ${option}` : option.label
      }
      renderInput={(params) => (
        <MyTextField
          params={params}
          textFieldProps={{ label, ...(textFieldProps || {}) }}
          useDiv={useDiv || false}
        />
      )}
      filterOptions={
        filterOptions
          ? (options, state) => filterOptions(options, state.inputValue)
          : // Passing undefined should ignore filtering but it doesnt
            (options) => options
      }
      clearOnEscape
      autoHighlight
      clearIcon={<ClearIcon />}
      onChange={(e: any, value, reason) => {
        switch (reason) {
          case 'clear':
            console.debug(`Autocomplete.clear`)
            if (onClear) {
              onClear()
            }
            break
          case 'selectOption':
            console.debug(`Autocomplete.select-option`, value)
            if (onSelectedOption && value) {
              onSelectedOption(value as AutocompleteOption<any>)
            }
            break
          case 'createOption':
            console.debug(`Autocomplete.create-option`, value)
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
            console.debug(`Autocomplete.onInputChange.input`, value)
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
      // openOnFocus
      multiple={multiple}
      className={className}
      classes={{
        groupLabel: 'test',
      }}
      {...autocompleteProps}
    />
  )
}

export default AutocompleteInput
