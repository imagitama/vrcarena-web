import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase'
import ThemeProvider from '@material-ui/styles/ThemeProvider'
import ClearIcon from '@material-ui/icons/Clear'

import { lightTheme } from '../../themes'

import LoadingIndicator from '../loading-indicator'

const sidePadding = '1rem'

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  inputWrapper: {
    padding: `2px 2px 2px ${sidePadding}`,
    borderRadius: '3rem',
    display: 'flex',
    alignItems: 'center',
    '@media (min-width: 960px)': {
      margin: '0 auto',
    },
  },
  input: {
    width: 'calc(100% - 50px)',
    fontSize: '1rem',
    padding: '0.25rem',
    marginLeft: 8,
    flex: 1,
  },
  clearButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: `0 ${sidePadding}`,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'rgba(0, 0, 0, 0.3)', // todo get from theme
    '&:hover': {
      cursor: 'pointer',
    },
  },
  searchingIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'rgba(0, 0, 0, 0.3)', // todo get from theme
  },
})

const BigSearchInput = ({
  onClear,
  isSearching = false,
  ...inputProps
}: {
  onClear: () => void
  isSearching?: boolean
} & InputBaseProps) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <ThemeProvider theme={lightTheme}>
        <Paper className={classes.inputWrapper}>
          <InputBase
            {...inputProps}
            className={`${classes.input} ${inputProps.className || ''}`}
          />
        </Paper>
        {isSearching ? (
          <div className={classes.searchingIcon}>Searching...</div>
        ) : null}
        <div className={classes.clearButton} onClick={onClear}>
          <ClearIcon />
        </div>
      </ThemeProvider>
    </div>
  )
}

export default BigSearchInput
