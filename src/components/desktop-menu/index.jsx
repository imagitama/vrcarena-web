import React, { useState, useRef } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import useUserRecord from '../../hooks/useUserRecord'

import navItems, {
  canShowMenuItem,
  getLabelForMenuItem,
} from '../../navigation'
import { trackAction } from '../../analytics'
import useUserPreferences from '../../hooks/useUserPreferences'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    color: '#FFF', // TODO: Get from theme
    '&:first-child': {
      menuItemLabel: {
        paddingLeft: 0,
      },
    },
  },
  menuItemLabel: {
    padding: '0.75rem',
    color: 'inherit',
    display: 'flex', // for icon
    alignItems: 'center',
    textAlign: 'center',
    textShadow: '1px 1px 1px #000',
    '&:hover': {
      cursor: 'pointer',
    },
    '& svg': {
      width: '1em',
    },
  },
  twitterBtn: {
    paddingLeft: '1rem',
    marginTop: '0.4rem',
  },
})

function Dropdown({ label, items, isOpen, onOpen, onClose }) {
  const { push } = useHistory()
  const labelRef = useRef()
  const classes = useStyles()

  const onClickItem = (url) => {
    push(url)
    onClose()
  }

  return (
    <>
      <span ref={labelRef} onClick={onOpen} className={classes.menuItemLabel}>
        {label} <KeyboardArrowDownIcon className={classes.icon} />
      </span>
      <Menu
        anchorEl={labelRef.current}
        getContentAnchorEl={null}
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
        {isChildrenAComponent(items)
          ? React.createElement(items, { onClose })
          : items.map(({ label, url }) => (
              <MenuItem key={url} onClick={() => onClickItem(url)}>
                {label}
              </MenuItem>
            ))}
      </Menu>
    </>
  )
}

function isChildrenAComponent(children) {
  return children && !Array.isArray(children)
}

const DesktopMenu = () => {
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [, , userPreferences] = useUserPreferences()
  const [openMenuItem, setOpenMenuItem] = useState(null)

  const closeMenuDropdown = () => {
    setOpenMenuItem(null)
  }

  return (
    <div className={classes.root}>
      {navItems
        .filter((navItem) => canShowMenuItem(navItem, user, userPreferences))
        .map(({ id, label, url, children }) => {
          const actualLabel = getLabelForMenuItem(label)

          const Anchor = ({ children }) =>
            url.includes('http') ? (
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
            ) : (
              <Link
                to={url}
                className={classes.menuItemLabel}
                onClick={() =>
                  trackAction('DesktopMenu', 'Click menu item', id)
                }>
                {children}
              </Link>
            )

          return (
            <div key={id} className={classes.menuItem}>
              {children ? (
                <Dropdown
                  label={actualLabel}
                  items={
                    isChildrenAComponent(children)
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
