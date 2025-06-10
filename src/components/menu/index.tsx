import React from 'react'
import { makeStyles } from '@mui/styles'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ClearIcon from '@mui/icons-material/Clear'

import Link from '../link'
import FormattedDate from '../formatted-date'

const useStyles = makeStyles({
  noPadding: {
    padding: '0 !important',
  },
  withPadding: {
    padding: '0.25rem 1rem',
  },
  link: {
    width: '100%',
    color: 'inherit',
    display: 'flex',
    flexWrap: 'wrap',
  },
  labelWithImage: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      width: '40px',
      height: '40px',
      marginRight: '0.5rem',
    },
  },
  date: {
    width: '100%',
    fontSize: '50%',
  },
  removeIcon: {
    marginRight: '1rem',
  },
})

export interface MenuItemData {
  id: string
  url?: string
  label: string
  onClick?: (event: React.SyntheticEvent) => void | Promise<void>
  imageUrl?: string
  date?: Date
  disabled?: boolean
  onRemove?: () => void | Promise<void>
  includeInCount?: boolean
}

export default ({
  isOpen,
  items,
  buttonRef,
  onClose,
  children,
  onClickItem,
  onRemove: onRemoveAnyItem,
}: {
  isOpen: boolean
  buttonRef: Element
  onClose: () => void
  items?: MenuItemData[]
  children?: React.ReactNode
  onClickItem?: (
    id: string,
    event: React.SyntheticEvent
  ) => void | Promise<void>
  onRemove?: () => void | Promise<void>
}) => {
  const close = () => onClose()
  const classes = useStyles()

  return (
    <Menu
      anchorEl={buttonRef}
      open={isOpen}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      onClose={onClose}>
      {items
        ? items.map(
            ({
              id,
              url,
              label,
              onClick,
              imageUrl,
              date,
              disabled,
              onRemove,
            }) => {
              const labelToUse = (
                <>
                  {imageUrl ? (
                    <div className={classes.labelWithImage}>
                      <img src={imageUrl} /> {label}
                    </div>
                  ) : (
                    label
                  )}
                  {date ? (
                    <div className={classes.date}>
                      <FormattedDate date={date} />
                    </div>
                  ) : null}
                </>
              )
              return (
                <MenuItem
                  key={id}
                  onClick={(e) => {
                    if (onClick) {
                      onClick(e)
                    }

                    if (onClickItem) {
                      onClickItem(id, e)
                    }
                  }}
                  disabled={disabled}
                  className={`${
                    url ? classes.noPadding : classes.withPadding
                  }`}>
                  {url ? (
                    <Link
                      to={url}
                      className={`${classes.link} ${classes.withPadding}`}
                      onClick={close}>
                      {labelToUse}
                    </Link>
                  ) : (
                    labelToUse
                  )}
                  {onRemove ? (
                    <div
                      className={classes.removeIcon}
                      onClick={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        await onRemove()

                        if (onRemoveAnyItem) {
                          onRemoveAnyItem()
                        }
                      }}>
                      <ClearIcon />
                    </div>
                  ) : null}
                </MenuItem>
              )
            }
          )
        : children}
    </Menu>
  )
}
