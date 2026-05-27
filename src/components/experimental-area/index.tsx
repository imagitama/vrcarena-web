import React from 'react'
import { makeStyles } from '@mui/styles'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import InfoIcon from '@mui/icons-material/Info'

import Tooltip from '../tooltip'

const useStyles = makeStyles({
  root: {
    padding: '1rem',
    border: '1px dashed rgba(0, 255, 0, 0.5)',
    backgroundColor: 'rgba(0, 255, 0, 0.01)',
    position: 'relative',
  },
  title: {
    fontSize: '75%',
    color: 'rgba(0, 255, 0, 0.5)',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem',
    cursor: 'default',
    '&:first-child': {
      top: 0,
      right: 0,
    },
    '&:last-child': {
      bottom: 0,
      left: 0,
    },
  },
})

const ExperimentalArea = ({
  children,
  title,
}: {
  children: React.ReactNode | React.ReactNode[]
  title?: string
}) => {
  const classes = useStyles()
  const Title = (
    <div className={classes.title}>
      <BubbleChartIcon /> Experimental{' '}
      {title && (
        <Tooltip title={title}>
          <InfoIcon />
        </Tooltip>
      )}
    </div>
  )
  return (
    <div className={classes.root}>
      {Title}
      {children}
      {Title}
    </div>
  )
}

export default ExperimentalArea
