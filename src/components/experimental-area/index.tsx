import React from 'react'
import { makeStyles } from '@mui/styles'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'

const useStyles = makeStyles({
  root: {
    padding: '1rem',
    border: '2px dashed rgba(0, 255, 0, 0.5)',
    backgroundColor: 'rgba(0, 255, 0, 0.01)',
    position: 'relative',
  },
  title: {
    color: 'rgba(0, 255, 0, 0.5)',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
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
}: {
  children: React.ReactNode | React.ReactNode[]
}) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <BubbleChartIcon /> Experimental
      </div>
      {children}
      <div className={classes.title}>
        <BubbleChartIcon /> Experimental
      </div>
    </div>
  )
}

export default ExperimentalArea
