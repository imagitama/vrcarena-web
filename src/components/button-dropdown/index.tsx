import React, { useRef, useState } from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ButtonGroup from '@mui/material/ButtonGroup'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CheckIcon from '@mui/icons-material/Check'
import { makeStyles } from '@mui/styles'

import Button, { ButtonProps } from '@/components/button'

// const useStyles = makeStyles({
//   root: {
//     display: 'inline-flex',
//   },
// })

export interface DropdownOption {
  id: string
  label: string
}

const ButtonDropdown = ({
  options,
  label = '',
  selectedId = undefined,
  selectedIds = [],
  closeOnSelect = true,
  onSelect,
  children,
  ...buttonProps
}: {
  options: DropdownOption[]
  label?: string
  selectedId?: string
  selectedIds?: string[]
  closeOnSelect?: boolean
  onSelect: (newId: string) => void
} & ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const onMainBtnClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const onClickItem = (optionId: string) => {
    onSelect(optionId)

    if (closeOnSelect) {
      onClose()
    }
  }

  const onClose = () => {
    setIsDropdownOpen(false)
  }

  return (
    <>
      <ButtonGroup>
        <Button
          {...buttonProps}
          icon={buttonProps.icon || <KeyboardArrowDownIcon />}
          onClick={(e) => {
            onMainBtnClick()

            if (buttonProps.onClick) {
              buttonProps.onClick(e)
            }
          }}
          ref={buttonRef}>
          {label}
        </Button>
        {children}
      </ButtonGroup>
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
          onClose={onClose}>
          {options.map(({ id, label }) => (
            <MenuItem key={id} onClick={() => onClickItem(id)}>
              {label}
              {selectedId === id || selectedIds.includes(id) ? (
                <>
                  {' '}
                  <CheckIcon />
                </>
              ) : null}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  )
}

export default ButtonDropdown
