import React, { useState } from 'react'
import Link from '../../components/link'
import Chip from '@material-ui/core/Chip'
import Tooltip from '@material-ui/core/Tooltip'
import { makeStyles } from '@material-ui/core/styles'
import * as routes from '../../routes'

const useStyles = makeStyles({
  chip: { margin: '0 0.25rem 0.25rem 0' },
  loading: {
    filter: 'blur(2px)'
  }
})

interface Props {
  tagName: string
  description?: string
  isFilled?: boolean
  isDisabled?: boolean
  onClick?: () => void
  icon?: React.ReactElement
  isLoading?: boolean
}

const ChipWithTooltip = ({
  tagName,
  description = '',
  isFilled = true,
  isDisabled = false,
  onClick = undefined,
  icon = undefined,
  isLoading = false
}: Props) => {
  const classes = useStyles()
  const [isOpen, setIsOpen] = useState(false)
  const onClickToUse = () => {
    if (!onClick) {
      return
    }
    setIsOpen(false)
    onClick()
  }
  return (
    <Tooltip
      arrow
      title={description}
      open={isOpen}
      onMouseEnter={() => setIsOpen(true)}
      onMouseOut={() => setIsOpen(false)}>
      <Chip
        className={classes.chip}
        label={
          isLoading ? (
            <span className={classes.loading}>{tagName}</span>
          ) : (
            tagName
          )
        }
        color={isFilled && !isDisabled ? 'primary' : undefined}
        disabled={isDisabled}
        clickable={!isDisabled}
        onClick={isDisabled !== true ? onClickToUse : undefined}
        icon={icon}
      />
    </Tooltip>
  )
}

export default (props: Props) => {
  return props.onClick || props.isDisabled ? (
    <ChipWithTooltip {...props} />
  ) : (
    <Link to={routes.queryWithVar.replace(':query', props.tagName)}>
      <ChipWithTooltip {...props} />
    </Link>
  )
}
