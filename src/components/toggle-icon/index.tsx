import React from 'react'
import { makeStyles } from '@mui/styles'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

const useStyles = makeStyles({
  root: {
    transition: 'all 200ms',
    fontSize: '150%',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  expanded: {
    transform: 'rotate(180deg)',
  },
})

const ToggleIcon = ({
  isExpanded,
  onClick,
}: {
  isExpanded: boolean
  onClick: () => void
}) => {
  const classes = useStyles()
  return (
    <span
      onClick={onClick}
      className={`${classes.root} ${isExpanded ? classes.expanded : ''}`}>
      <KeyboardArrowUpIcon />
    </span>
  )
}

export default ToggleIcon
