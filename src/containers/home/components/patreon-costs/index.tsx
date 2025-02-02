import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { totalCostPerMonth } from '../../../../costs'
import { colorPalette } from '../../../../config'

const useStyles = makeStyles({
  root: {
    '& > div': {
      display: 'flex',
      alignItems: 'center',
    },
  },
  income: {},
  expenditure: {},
  result: {},
  label: {
    display: 'block',
    width: '50%',
    textAlign: 'right',
    paddingRight: '1rem',
    fontSize: '80%',
  },
  cost: {
    fontSize: '150%',
  },
  negative: {
    color: colorPalette.negative,
    animation: '500ms $pulseNegativeCost infinite alternate',
  },
  '@keyframes pulseNegativeCost': {
    from: {
      opacity: 1,
    },
    to: {
      opacity: 0.5,
    },
  },
})

export default ({
  isLoading,
  incomeCentsAfterTaxes,
}: {
  isLoading: boolean
  incomeCentsAfterTaxes?: number
}) => {
  const classes = useStyles()
  const incomeDollars =
    !isLoading && incomeCentsAfterTaxes ? incomeCentsAfterTaxes / 100 : 0
  const diff = totalCostPerMonth - incomeDollars

  return (
    <div className={classes.root}>
      <div className={classes.income}>
        <span className={classes.label}>Income from Patreon</span>{' '}
        <span className={classes.cost}>
          ${isLoading ? '--' : incomeDollars.toFixed(2)}
        </span>
      </div>
      <div className={classes.expenditure}>
        <span className={classes.label}>Server costs</span>{' '}
        <span className={classes.cost}>
          ${isLoading ? '--' : totalCostPerMonth.toFixed(2)}
        </span>
      </div>
      <div className={classes.result}>
        <span className={classes.label} />{' '}
        <span
          className={`${classes.cost} ${
            !isLoading && diff > 0 ? classes.negative : ''
          }`}>
          {!isLoading && diff > 0 ? '-' : ''}$
          {isLoading ? '--' : diff.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
