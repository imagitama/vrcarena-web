import React from 'react'
import EditIcon from '@material-ui/icons/Edit'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles({
  root: {
    width: '40px',
    height: '40px',
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '5px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100,
    transition: 'all 100ms',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.4)'
    }
  }
})

export default ({ onClick }) => {
  const classes = useStyles()
  return (
    <div className={classes.root} onClick={onClick}>
      <EditIcon />
    </div>
  )
}
