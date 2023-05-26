import React from 'react'
import { writeStorage } from '@rehooks/local-storage'
import { useDispatch } from 'react-redux'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import useStorage, { keys } from '../../hooks/useStorage'
import { toggleDarkMode } from '../../modules/app'

export default ({ onClick = null }) => {
  const [isDarkModeEnabled] = useStorage(keys.darkModeEnabled, false)
  const dispatch = useDispatch()

  const onCheckboxChange = () => {
    const newValue = !isDarkModeEnabled

    if (onClick) {
      onClick({ newValue })
    }

    writeStorage(keys.darkModeEnabled, newValue)

    dispatch(toggleDarkMode())
  }

  return (
    <FormControl>
      <FormControlLabel
        control={
          <Checkbox checked={isDarkModeEnabled} onChange={onCheckboxChange} />
        }
        label="Dark mode enabled"
      />
    </FormControl>
  )
}
