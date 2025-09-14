import React, { useRef, useState } from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import useSorting, { SortingConfig } from '../../hooks/useSorting'
import { OrderDirections } from '../../hooks/useDatabaseQuery'
import Button from '../button'
import { Sort as SortIcon } from '../../icons'

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

export interface SortOption<TRecord extends Record<string, any>> {
  fieldName: keyof TRecord | 'random'
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

const SortControls = <TRecord extends Record<string, any>>({
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
          icon={<SortIcon />}
          color="secondary"
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
              onClick={() =>
                onClickItem(
                  fieldName as string,
                  direction !== undefined ? direction : OrderDirections.DESC
                )
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
