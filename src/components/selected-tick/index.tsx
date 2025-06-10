import React from 'react'
import CheckIcon from '@mui/icons-material/Check'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  root: {
    background: 'rgb(255, 255, 0)',
    color: '#000',
    borderRadius: '100%',
    padding: '0.5rem',
    position: 'absolute',
    top: '-15px',
    left: '-15px',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
})

const SelectedTick = ({ className }: { className?: string }) => {
  const classes = useStyles()

  return (
    <div className={`${classes.root} ${className}`}>
      <CheckIcon />
    </div>
  )
}

export default SelectedTick
