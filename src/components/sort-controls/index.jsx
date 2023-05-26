import React, { useRef, useState } from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import useSorting from '../../hooks/useSorting'
import { OrderDirections } from '../../hooks/useDatabaseQuery'
import Button from '../button'

const getLabelForSelectedSortOption = (sorting, sortOptions) => {
  const match = sortOptions.find(
    option =>
      option.fieldName === sorting.fieldName &&
      (option.withDirections === false ||
        option.direction === sorting.direction)
  )

  if (match) {
    return match.label
  }

  return '???'
}

const appendDirections = options => {
  const newOptions = []

  for (const { fieldName, label, withDirections } of options) {
    if (withDirections === false) {
      newOptions.push({
        fieldName,
        label,
        withDirections: false
      })
      continue
    }

    newOptions.push({
      fieldName,
      label: `${label} (${OrderDirections.ASC})`,
      direction: OrderDirections.ASC
    })

    newOptions.push({
      fieldName,
      label: `${label} (${OrderDirections.DESC})`,
      direction: OrderDirections.DESC
    })
  }

  return newOptions
}

export default ({ sortKey, options, defaultFieldName = '' }) => {
  const [sorting, setSorting] = useSorting(sortKey, defaultFieldName)
  const buttonRef = useRef()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const optionsWithDirections = appendDirections(options)

  const onClickItem = (fieldName, direction) =>
    setSorting({
      fieldName,
      direction
    })

  return (
    <>
      <span ref={buttonRef}>
        <Button onClick={() => setIsDropdownOpen(currentVal => !currentVal)}>
          Sort by{' '}
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
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
          onClose={() => setIsDropdownOpen(false)}>
          {optionsWithDirections.map(({ fieldName, label, direction }) => (
            <MenuItem
              key={`${fieldName}.${direction}`}
              onClick={() => onClickItem(fieldName, direction)}>
              {label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  )
}
