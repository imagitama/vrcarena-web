import React, { ChangeEventHandler } from 'react'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import Autocomplete, {
  AutocompleteRenderInputParams,
} from '@material-ui/lab/Autocomplete'
import { makeStyles } from '@material-ui/core/styles'

export interface AutocompleteOption<T> {
  label: string
  data: T
  isDisabled?: boolean
}

// @ts-ignore
const useStyles = makeStyles((theme) => ({
  divInput: {
    wordWrap: 'anywhere',
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
    <div ref={params.InputProps.ref}>
      {useDiv ? (
        <div
          // @ts-ignore
          ref={params.inputProps.ref}
          placeholder={textFieldProps.placeholder}
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

            // @ts-ignore
            params.inputProps.onChange(
              {
                target,
              },
              'input'
            )
          }}
        />
      ) : (
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
  return (
    <Autocomplete
      options={options}
      getOptionDisabled={(option) => option.isDisabled === true}
      getOptionLabel={(option: AutocompleteOption<TOption>) => option.label}
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
      // @ts-ignore
      onChange={(e: any, value, reason) => {
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
      {...autocompleteProps}
    />
  )
}

export default AutocompleteInput
