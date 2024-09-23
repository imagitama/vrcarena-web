import React, { useRef, useState } from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import FilterListIcon from '@material-ui/icons/FilterList'

import useSorting, { SortingConfig } from '../../hooks/useSorting'
import { OrderDirections } from '../../hooks/useDatabaseQuery'
import Button from '../button'

const getLabelForSelectedSortOption = (
  sorting: SortingConfig | null,
  sortOptions: SortOption<any>[]
): string => {
  if (!sorting) {
    return '...'
  }

  const match = sortOptions.find(
    (option) =>
      option.fieldName === sorting.fieldName &&
      (option.withDirections === false ||
        option.direction === sorting.direction)
  )

  if (match) {
    return match.label
  }

  return '...'
}

export interface SortOption<TRecord> {
  fieldName: keyof TRecord
  label: string
  direction?: OrderDirections
  withDirections?: boolean
}

const appendDirections = (options: SortOption<any>[]): SortOption<any>[] => {
  const newOptions = []

  for (const { fieldName, label, withDirections } of options) {
    if (withDirections === false) {
      newOptions.push({
        fieldName,
        label,
        withDirections: false,
      })
      continue
    }

    newOptions.push({
      fieldName,
      label: `${label} (${OrderDirections[OrderDirections.ASC]})`,
      direction: OrderDirections.ASC,
    })

    newOptions.push({
      fieldName,
      label: `${label} (${OrderDirections[OrderDirections.DESC]})`,
      direction: OrderDirections.DESC,
    })
  }

  return newOptions
}

const SortControls = <TRecord,>({
  sortKey,
  options,
  defaultFieldName = '',
}: {
  sortKey: string
  options: SortOption<TRecord>[]
  defaultFieldName?: string
}) => {
  const [sorting, setSorting] = useSorting(sortKey, defaultFieldName)
  const buttonRef = useRef<HTMLSpanElement>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const optionsWithDirections = appendDirections(options)

  const onClickItem = (fieldName: string, direction: OrderDirections) => {
    setSorting({
      fieldName,
      direction,
    })
    setIsDropdownOpen(false)
  }

  return (
    <>
      <span ref={buttonRef}>
        <Button
          onClick={() => setIsDropdownOpen((currentVal) => !currentVal)}
          icon={<FilterListIcon />}
          color="default"
          size="small"
          switchIconSide>
          {getLabelForSelectedSortOption(sorting, optionsWithDirections)}
          <KeyboardArrowDownIcon />
        </Button>
      </span>
      {isDropdownOpen && (
        <Menu
          anchorEl={buttonRef.current}
          open={isDropdownOpen}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          onClose={() => setIsDropdownOpen(false)}>
          {optionsWithDirections.map(({ fieldName, label, direction }) => (
            <MenuItem
              key={`${fieldName as string}.${direction}`}
              onClick={
                direction !== undefined
                  ? () => onClickItem(fieldName as string, direction)
                  : undefined
              }>
              {label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  )
}

export default SortControls
