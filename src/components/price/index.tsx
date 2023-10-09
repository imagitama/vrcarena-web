import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { popularCurrencies } from '../../currency'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'inline-block',

    width: 'auto',
    height: '38px',

    // @ts-ignore
    'background-color': theme.palette.tertiary.main,
    '-webkit-border-radius': '3px 4px 4px 3px',
    '-moz-border-radius': '3px 4px 4px 3px',
    'border-radius': '3px 4px 4px 3px',

    // @ts-ignore
    'border-left': `1px solid ${theme.palette.tertiary.main}`,

    /* This makes room for the triangle */
    'margin-left': '19px',

    position: 'relative',

    color: 'white',
    // 'font-weight': '300',
    // 'font-size': '22px',
    'line-height': '38px',

    padding: '0 10px 0 10px',

    /* Makes the triangle */
    '&:before': {
      content: '""',
      position: 'absolute',
      display: 'block',
      left: '-19px',
      width: '0',
      height: '0',
      'border-top': '19px solid transparent',
      'border-bottom': '19px solid transparent',
      // @ts-ignore
      'border-right': `19px solid ${theme.palette.tertiary.main}`
    },

    '&:after': {
      content: '""',
      'background-color': '#282828',
      'border-radius': '50%',
      width: '4px',
      height: '4px',
      display: 'block',
      position: 'absolute',
      left: '-9px',
      top: '17px'
    }
  },
  price: {
    fontSize: '150%',
    fontWeight: 'bold'
  },
  currency: {
    fontSize: '75%'
  },
  loading: {
    // more blur than everything else as price is sensitive and we dont want to give the wrong price!
    filter: 'blur(3px)'
  }
}))

// show "+" symbol as some gumroad products have multiple variants
// and the API only gives us a price for one of them (which is random?)
export default ({
  price,
  priceCurrency,
  isLoading = false
}: {
  price: number
  priceCurrency: keyof typeof popularCurrencies
  isLoading?: boolean
}) => {
  const classes = useStyles()

  if (!price) {
    return null
  }

  return (
    <div className={classes.root}>
      <span className={`${isLoading ? classes.loading : ''}`}>
        <span className={classes.price}>
          {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
        </span>{' '}
        {price === 0 ? null : (
          <span className={classes.currency}>{priceCurrency}</span>
        )}
      </span>
    </div>
  )
}
