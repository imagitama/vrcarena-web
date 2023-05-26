import React, { useRef, useState } from 'react'
import { writeStorage } from '@rehooks/local-storage'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import { makeStyles } from '@material-ui/core/styles'

import Button from '../../components/button'

const useStyles = makeStyles({
  controls: {
    textAlign: 'right'
  }
})

export default ({
  options,
  label,
  fieldNameKey,
  directionKey,
  onNewSortFieldAndDirection,
  onOpenDropdown
}) => {
  const classes = useStyles()
  const buttonRef = useRef()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const onMainBtnClick = () => {
    if (!isDropdownOpen) {
      onOpenDropdown()
    }
    setIsDropdownOpen(!isDropdownOpen)
  }

  const onClickItem = (fieldName, direction) => {
    writeStorage(fieldNameKey, fieldName)
    writeStorage(directionKey, direction)
    onNewSortFieldAndDirection(fieldName, direction)
    onClose()
  }

  const onClose = () => {
    setIsDropdownOpen(false)
  }

  return (
    <div className={classes.controls}>
      <span ref={buttonRef}>
        <Button onClick={onMainBtnClick}>
          Sort by {label}
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
          onClose={onClose}>
          {Object.entries(options).map(([label, { fieldName, direction }]) => (
            <MenuItem
              key={`${fieldName}.${direction}`}
              onClick={() => onClickItem(fieldName, direction)}>
              {label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  )
}
