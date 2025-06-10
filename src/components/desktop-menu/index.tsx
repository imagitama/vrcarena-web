import React, { useState, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@mui/styles'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import useUserRecord from '../../hooks/useUserRecord'

import navItems, {
  MenuItem as NavMenuItem,
  canShowMenuItem,
  getLabelForMenuItem,
} from '../../navigation'
import { trackAction } from '../../analytics'
import useUserPreferences from '../../hooks/useUserPreferences'
import Link from '../link'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
    '&:hover $menuItemLabel': {
      opacity: 0.8,
    },
  },
  menuItem: {
    whiteSpace: 'nowrap',
    color: '#FFF', // TODO: Get from theme
    '&:first-child': {
      menuItemLabel: {
        paddingLeft: 0,
      },
    },
  },
  menuItemLabel: {
    padding: '0.25rem 0.5rem',
    opacity: 1,
    color: 'inherit',
    display: 'flex', // for icon
    alignItems: 'center',
    textAlign: 'center',
    textShadow: '1px 1px 2px #000',
    transition: '100ms all',
    '&:hover': {
      cursor: 'pointer',
      opacity: '1 !important',
    },
    '& svg': {
      fontSize: '150%',
    },
  },
  twitterBtn: {
    paddingLeft: '1rem',
    marginTop: '0.4rem',
  },
})

function Dropdown({
  label,
  items,
  isOpen,
  onOpen,
  onClose,
}: {
  label: string
  items: NavMenuItem[]
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const { push } = useHistory()
  const labelRef = useRef<HTMLSpanElement>(null)
  const classes = useStyles()

  const onClickItem = (url: string) => {
    push(url)
    onClose()
  }

  return (
    <>
      <span ref={labelRef} onClick={onOpen} className={classes.menuItemLabel}>
        {label} <KeyboardArrowDownIcon />
      </span>
      <Menu
        anchorEl={labelRef.current}
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
        {!Array.isArray(items)
          ? React.createElement(items, { onClose })
          : items.map(({ label, url }) => (
              <MenuItem
                key={url}
                onClick={url ? () => onClickItem(url) : undefined}>
                {label}
              </MenuItem>
            ))}
      </Menu>
    </>
  )
}

const DesktopMenu = () => {
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [, , userPreferences] = useUserPreferences()
  const [openMenuItem, setOpenMenuItem] = useState<string | null>(null)

  const closeMenuDropdown = () => {
    setOpenMenuItem(null)
  }

  return (
    <div className={classes.root}>
      {navItems
        .filter((navItem) => canShowMenuItem(navItem, user, userPreferences))
        .map(({ id, label, url, children }) => {
          const actualLabel = getLabelForMenuItem(label)

          const Anchor = ({ children }: { children: React.ReactNode }) =>
            url && url.includes('http') ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.menuItemLabel}
                onClick={() =>
                  trackAction('DesktopMenu', 'Click external link', url)
                }>
                {children}
              </a>
            ) : url ? (
              <Link
                to={url}
                className={classes.menuItemLabel}
                onClick={() =>
                  trackAction('DesktopMenu', 'Click menu item', id)
                }>
                {children}
              </Link>
            ) : (
              <>(no URL)</>
            )

          return (
            <div key={id} className={classes.menuItem}>
              {children ? (
                <Dropdown
                  label={actualLabel}
                  items={
                    !Array.isArray(children)
                      ? children
                      : children.filter((navItem) =>
                          canShowMenuItem(navItem, user, userPreferences)
                        )
                  }
                  isOpen={openMenuItem === id}
                  onOpen={() => {
                    setOpenMenuItem(id)
                    trackAction('DesktopMenu', 'Open dropdown menu', id)
                  }}
                  onClose={() => closeMenuDropdown()}
                />
              ) : (
                <Anchor>{actualLabel}</Anchor>
              )}
            </div>
          )
        })}
    </div>
  )
}

export default DesktopMenu
