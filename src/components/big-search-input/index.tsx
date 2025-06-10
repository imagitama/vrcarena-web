import React from 'react'
import { makeStyles } from '@mui/styles'
import Paper from '@mui/material/Paper'
import InputBase, { InputBaseProps } from '@mui/material/InputBase'
import ClearIcon from '@mui/icons-material/Clear'

const sidePadding = '1rem'

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  paper: {
    padding: `2px 2px 2px ${sidePadding}`,
    borderRadius: '3rem !important',
    display: 'flex',
    alignItems: 'center',
    '@media (min-width: 960px)': {
      margin: '0 auto',
    },
    backgroundColor: '#FFF !important',
  },
  input: {
    width: 'calc(100% - 50px)',
    fontSize: '1rem',
    padding: '0.25rem',
    marginLeft: 8,
    flex: 1,
    color: '#222 !important',
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
      <Paper classes={{ root: classes.paper }}>
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
    </div>
  )
}

export default BigSearchInput
