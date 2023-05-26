import React, { useState } from 'react'
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart'
import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart'
import DoneAllIcon from '@material-ui/icons/DoneAll'
import Tooltip from '@material-ui/core/Tooltip'
import useCart from '../../hooks/useCart'
import { makeStyles } from '@material-ui/styles'
import Button from '../button'
import useTimer from '../../hooks/useTimer'

const useStyles = makeStyles({
  root: {
    padding: '0.5rem',
    color: '#FFF',
    opacity: 0.5,
    transition: '100ms all',
    filter: 'drop-shadow(1px 1px 1px #000)',
    '&:hover': {
      opacity: 1
    }
  },
  inCart: {
    color: 'rgb(200, 255, 200)',
    opacity: 1
  }
})

export default ({
  assetId,
  isLoading = false,
  asButton = false
}: {
  assetId: string
  isLoading?: boolean
  asButton?: boolean
}) => {
  const { ids, add, remove } = useCart()
  const classes = useStyles()
  const [isTooltipShown, setIsTooltipShown] = useState(false)

  const startTimer = useTimer(() => setIsTooltipShown(false), 2000)

  if (!assetId) {
    return null
  }

  const isInCart = assetId && ids.includes(assetId)

  const addAssetToCart = () => add(assetId)
  const removeAssetFromCart = () => remove(assetId)

  const onClick = (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInCart) {
      console.debug(`Removing asset ${assetId} from cart...`)
      removeAssetFromCart()
    } else {
      console.debug(`Adding asset ${assetId} to cart...`)
      addAssetToCart()

      setIsTooltipShown(true)
      startTimer()
    }
  }

  if (asButton) {
    return (
      <Button
        onClick={onClick}
        color="default"
        isLoading={isLoading}
        icon={isInCart ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}>
        {isInCart ? 'Remove From Cart' : 'Add To Cart'}
      </Button>
    )
  } else {
    return (
      <Tooltip
        arrow
        title="Added to your cart!"
        placement="top"
        open={isTooltipShown}>
        <div
          onClick={onClick}
          className={`${classes.root} ${isInCart ? classes.inCart : ''}`}>
          {isInCart ? <DoneAllIcon /> : <AddShoppingCartIcon />}
        </div>
      </Tooltip>
    )
  }
}
