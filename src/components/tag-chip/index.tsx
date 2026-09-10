import React, { Suspense, useState } from 'react'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { makeStyles } from '@mui/styles'

import * as routes from '@/routes'
import Link from '@/components/link'
import { colorGreyedOut } from '@/themes'
import { colorPalette } from '@/config'

const useStyles = makeStyles({
  chip: {
    '&&': {
      background: 'transparent !important',
      border: '1px solid rgba(255,255,255,0.5)',
      '&:hover': {
        background: 'rgba(255,255,255,0.5)',
      },
    },
  },
  positive: {
    '&&': {
      borderColor: 'rgb(50, 150, 50)',
    },
  },
  negative: {
    '&&': {
      borderColor: 'rgb(150, 50, 50)',
    },
  },
  loading: {
    filter: 'blur(2px)',
  },
  count: {
    marginLeft: '0.5rem',
    fontSize: '75%',
    color: colorGreyedOut,
  },
})

interface ChipWithTooltipProps {
  tagName: string
  description?: string
  isFilled?: boolean
  isDisabled?: boolean
  onClick?: () => void
  icon?: React.ReactElement
  isLoading?: boolean
  label?: React.ReactNode
  onDelete?: () => void
  noLink?: boolean
  className?: string
  visualOnly?: boolean
  count?: number
  positivity?: 1 | 0 | -1
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
  count,
  positivity,
}: ChipWithTooltipProps) => {
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
        className={`${classes.chip} ${className} ${
          positivity === 1
            ? classes.positive
            : positivity === -1
            ? classes.negative
            : ''
        }`}
        label={
          isLoading ? (
            <span className={classes.loading}>{tagName}</span>
          ) : (
            <>
              {label ? label : tagName}
              {count !== undefined ? (
                <span className={classes.count}>{count}</span>
              ) : null}
            </>
          )
        }
        color={isFilled && !isDisabled ? 'primary' : undefined}
        disabled={isDisabled}
        clickable={!isDisabled || visualOnly}
        onClick={isDisabled !== true ? onClickToUse : undefined}
        // icon={<Suspense fallback={null}>{icon}</Suspense>}
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

const TagChip = (props: ChipWithTooltipProps) => {
  return props.onClick ||
    props.isDisabled ||
    props.noLink ||
    props.visualOnly ? (
    <span>
      <ChipWithTooltip {...props} />
    </span>
  ) : (
    <Link to={routes.viewTagWithVar.replace(':tag', props.tagName)}>
      <ChipWithTooltip {...props} />
    </Link>
  )
}

export default TagChip
