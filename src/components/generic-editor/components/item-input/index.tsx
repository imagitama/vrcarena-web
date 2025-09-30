import React from 'react'
import MenuItem from '@mui/material/MenuItem'
import Select from '../../../select'
import { ItemEditableField } from '../../../../editable-fields'
import useDataStoreItems from '../../../../hooks/useDataStoreItems'
import LoadingIndicator from '../../../loading-indicator'
import ErrorMessage from '../../../error-message'
import NoResultsMessage from '../../../no-results-message'

interface ItemInputOption {
  value: string
  label: string
  disabled?: boolean
}

export default ({
  editableField,
  onChange,
  value = null,
}: {
  editableField: ItemEditableField<any, any>
  onChange: (newVal: any) => void
  value: string | null
} & ItemEditableField<any, any>) => {
  const [isLoading, lastErrorCode, items] = useDataStoreItems<any>(
    editableField.collectionName,
    undefined,
    { queryName: 'item-input' }
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading items..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load items (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (!items || !items.length) {
    return <NoResultsMessage />
  }

  const options: ItemInputOption[] = items
    .map((item) => ({
      value: item.id,
      label: editableField.fieldAsLabel
        ? item[editableField.fieldAsLabel]
        : editableField.getLabel
        ? editableField.getLabel(item)
        : item.id,
      disabled: false,
    }))
    .concat([
      {
        value: '',
        label: 'Special',
        disabled: true,
      },
      {
        value: 'other',
        label: 'Other (not listed)',
        disabled: false,
      },
      {
        value: null,
        label: 'None',
        disabled: false,
      },
    ])

  return (
    <Select
      //   fullWidth
      value={value}
      onChange={(e: any) => onChange(e.target.value)}>
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  )
}
