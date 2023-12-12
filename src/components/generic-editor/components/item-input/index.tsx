import React from 'react'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '../../../select'
import { ItemProperties } from '../../../../editable-fields'
import useDataStoreItems from '../../../../hooks/useDataStoreItems'
import LoadingIndicator from '../../../loading-indicator'
import ErrorMessage from '../../../error-message'
import NoResultsMessage from '../../../no-results-message'

export default ({
  onChange,
  value = null,
  itemProperties,
}: {
  onChange: (newVal: any) => void
  value: string | null
  itemProperties: ItemProperties
}) => {
  const [isLoading, isError, items] = useDataStoreItems<any>(
    itemProperties.collectionName
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading items..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load items</ErrorMessage>
  }

  if (!items || !items.length) {
    return <NoResultsMessage />
  }

  const options = items.map((item) => ({
    value: item.id,
    label: itemProperties.fieldAsLabel
      ? item[itemProperties.fieldAsLabel]
      : itemProperties.getLabel
      ? itemProperties.getLabel(item)
      : item.id,
  }))

  return (
    <Select
      //   fullWidth
      value={value}
      onChange={(e: any) => onChange(e.target.value)}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value || undefined}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  )
}
