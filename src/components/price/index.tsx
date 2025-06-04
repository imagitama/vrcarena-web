import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import HelpIcon from '@material-ui/icons/Help'
import { defaultCurrency, formatPrice, popularCurrencies } from '../../currency'
import * as routes from '../../routes'
import Link from '../link'

const useStyles = makeStyles((theme) => ({
  tag: {
    display: 'inline-block',
    width: 'auto',
    height: '38px',
    whiteSpace: 'nowrap',

    // @ts-ignore
    'background-color': theme.palette.tertiary.main,
    '-webkit-border-radius': '3px 4px 4px 3px',
    '-moz-border-radius': '3px 4px 4px 3px',
    'border-radius': '3px 4px 4px 3px',

    // @ts-ignore
    borderLeft: `1px solid ${theme.palette.tertiary.main}`,

    /* This makes room for the triangle */
    marginLeft: '19px',

    position: 'relative',

    color: 'white',
    lineHeight: '38px',

    padding: '0 10px',

    /* Makes the triangle */
    '&:before': {
      content: '""',
      position: 'absolute',
      display: 'block',
      left: '-18.5px',
      width: '0',
      height: '0',
      'border-top': '19px solid transparent',
      'border-bottom': '19px solid transparent',
      // @ts-ignore
      'border-right': `19px solid ${theme.palette.tertiary.main}`,
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
      top: '17px',
    },
  },
  price: {
    fontSize: '150%',
    fontWeight: 'bold',
  },
  currency: {
    fontSize: '65%',
  },
  loading: {
    // more blur than everything else as price is sensitive and we dont want to give the wrong price!
    filter: 'blur(3px)',
  },
  small: {
    height: '24px',
    marginLeft: '12px',
    lineHeight: '24px',
    padding: '0 7px 0 7px',

    '&:before': {
      left: '-12px',
      'border-top': '12px solid transparent',
      'border-bottom': '12px solid transparent',
      // @ts-ignore
      'border-right': `12px solid ${theme.palette.tertiary.main}`,
    },

    '&:after': {
      left: '-6px',
      top: '11px',
    },

    '& $price': {
      fontSize: '100%',
    },
  },
  priceWarning: {
    fontSize: '50%',
    marginTop: '0.25rem',
    '& svg': {
      fontSize: '100%',
    },
  },
  greyscale: {
    backgroundColor: '#e0e0e0',
    borderLeftColor: `#e0e0e0`,
    '&:before': {
      borderRightColor: `#e0e0e0`,
    },
    color: '#5d5d5d',
  },
}))

// show "+" symbol as some gumroad products have multiple variants
// and the API only gives us a price for one of them (which is random?)
const Price = ({
  price,
  priceCurrency,
  isLoading = false,
  small = false,
  showPriceWarning = false, // only used on assetoverview
  isGreyscale = false,
  className,
}: {
  price: number
  priceCurrency: keyof typeof popularCurrencies
  isLoading?: boolean
  small?: boolean
  showPriceWarning?: boolean
  isGreyscale?: boolean
  className?: string
}) => {
  const classes = useStyles()

  const currency = priceCurrency || defaultCurrency

  return (
    <div>
      <div
        className={`${classes.tag} ${small ? classes.small : ''} ${
          isGreyscale ? classes.greyscale : ''
        } ${className}`}
        title="This price may be different on the official website.">
        <span className={`${isLoading ? classes.loading : ''}`}>
          <span className={classes.price}>
            {price === 0 || price === null
              ? 'FREE'
              : formatPrice(price, priceCurrency, false)}
            *
          </span>{' '}
          {price === 0 ? null : (
            <span className={classes.currency}>{currency}</span>
          )}
        </span>
      </div>
      {showPriceWarning ? (
        <div className={classes.priceWarning}>
          This price may be different on the official website.{' '}
          <Link to={routes.prices}>
            <HelpIcon />
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default Price
