import React, { useState } from 'react'
import Link from '../../components/link'
import Chip from '@material-ui/core/Chip'
import Tooltip from '@material-ui/core/Tooltip'
import { makeStyles } from '@material-ui/core/styles'
import * as routes from '../../routes'

const useStyles = makeStyles({
  chip: { margin: '0 0.25rem 0.25rem 0' },
  loading: {
    filter: 'blur(2px)',
  },
})

interface Props {
  tagName: string
  description?: string
  isFilled?: boolean
  isDisabled?: boolean
  onClick?: () => void
  icon?: React.ReactElement
  isLoading?: boolean
  label?: string
  onDelete?: () => void
  noLink?: boolean
  className?: string
  visualOnly?: boolean
}

const ChipWithTooltip = ({
  tagName,
  label = '',
  description = '',
  isFilled = true,
  isDisabled = false,
  onClick = undefined,
  icon = undefined,
  isLoading = false,
  onDelete = undefined,
  className = undefined,
  visualOnly = false,
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
        className={`${classes.chip} ${className}`}
        label={
          isLoading ? (
            <span className={classes.loading}>{tagName}</span>
          ) : label ? (
            label
          ) : (
            tagName
          )
        }
        color={isFilled && !isDisabled ? 'primary' : undefined}
        disabled={isDisabled}
        clickable={!isDisabled || visualOnly}
        onClick={isDisabled !== true ? onClickToUse : undefined}
        icon={icon}
        onDelete={
          onDelete
            ? (e) => {
                onDelete()
                e.preventDefault()
                e.stopPropagation()
                return false
              }
            : undefined
        }
      />
    </Tooltip>
  )
}

export default (props: Props) => {
  return props.onClick ||
    props.isDisabled ||
    props.noLink ||
    props.visualOnly ? (
    <ChipWithTooltip {...props} />
  ) : (
    <Link to={routes.viewTagWithVar.replace(':tag', props.tagName)}>
      <ChipWithTooltip {...props} />
    </Link>
  )
}
