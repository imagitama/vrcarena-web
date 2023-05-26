import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LoadingShimmer from '../../../../components/loading-shimmer'
import useSupabaseView from '../../../../hooks/useSupabaseView'
import { CachedPatreonMember } from '../../../../modules/patreonmembercache'
import { patreonTax, totalCostPerMonth } from '../../../../costs'
import { colorPalette } from '../../../../config'

const defaultText = `All of the costs for running the site are paid by our amazing
Patreon supporters. The lowest tier is $1 to unlock bonus features
such as featuring on the homepage.`

const useStyles = makeStyles({
  root: {
    '& > div': {
      display: 'flex',
      alignItems: 'center'
    }
  },
  income: {},
  expenditure: {},
  result: {},
  label: {
    display: 'block',
    width: '50%',
    textAlign: 'right',
    paddingRight: '1rem',
    fontSize: '80%'
  },
  cost: {
    fontSize: '150%'
  },
  negative: {
    color: colorPalette.negative,
    animation: '500ms $pulseNegativeCost infinite alternate'
  },
  '@keyframes pulseNegativeCost': {
    from: {
      opacity: 1
    },
    to: {
      opacity: 0.5
    }
  }
})

export default () => {
  const [isLoading, isError, members] = useSupabaseView<CachedPatreonMember[]>(
    'getAnonymousPatreonMembers'
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingShimmer height="20px" />
  }

  if (isError || !Array.isArray(members)) {
    return null
  }

  const incomeCents = members.reduce(
    (finalIncomeCents, { currentlyentitledamountcents }) =>
      finalIncomeCents + currentlyentitledamountcents,
    0
  )

  const incomeCentsAfterTaxes = incomeCents * (1 - patreonTax)
  const incomeDollars = incomeCentsAfterTaxes / 100

  const diff = totalCostPerMonth - incomeDollars

  return (
    <div className={classes.root}>
      <div className={classes.income}>
        <span className={classes.label}>Income from Patreon</span>{' '}
        <span className={classes.cost}>${incomeDollars.toFixed(2)}</span>
      </div>
      <div className={classes.expenditure}>
        <span className={classes.label}>Running costs</span>{' '}
        <span className={classes.cost}>${totalCostPerMonth.toFixed(2)}</span>
      </div>
      <div className={classes.result}>
        <span className={classes.label} />{' '}
        <span className={`${classes.cost} ${diff > 0 ? classes.negative : ''}`}>
          {diff > 0 ? '-' : ''}${diff.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
