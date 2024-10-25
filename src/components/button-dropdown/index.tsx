import React, { useRef, useState } from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import CheckIcon from '@material-ui/icons/Check'
import { makeStyles } from '@material-ui/core/styles'

import Button, { ButtonProps } from '../../components/button'

const useStyles = makeStyles({
  root: {
    display: 'inline-flex',
  },
})

interface DropdownOption {
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
  ...buttonProps
}: {
  options: DropdownOption[]
  label?: string
  selectedId?: string
  selectedIds?: string[]
  closeOnSelect?: boolean
  onSelect: (newId: string) => void
} & ButtonProps) => {
  const classes = useStyles()
  const buttonRef = useRef<HTMLElement | null>(null)
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
    <div className={classes.root}>
      <span ref={buttonRef}>
        <Button
          {...buttonProps}
          icon={buttonProps.icon || <KeyboardArrowDownIcon />}
          onClick={(e) => {
            onMainBtnClick()

            if (buttonProps.onClick) {
              buttonProps.onClick(e)
            }
          }}>
          {label}
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
    </div>
  )
}

export default ButtonDropdown
