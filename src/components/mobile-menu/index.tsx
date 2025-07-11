import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Link from '../../components/link'
import { makeStyles } from '@mui/styles'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Drawer from '@mui/material/Drawer'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import ListItemIcon from '@mui/material/ListItemIcon'

import useUserRecord from '../../hooks/useUserRecord'
import { closeMenu } from '../../modules/app'
import navItems, {
  canShowMenuItem,
  getLabelForMenuItem,
} from '../../navigation'
import { trackAction } from '../../analytics'

import AccountMenu from '../account-menu'
import useUserPreferences from '../../hooks/useUserPreferences'

const useStyles = makeStyles({
  content: {
    width: '280px',
  },
  menuListLink: {
    color: 'inherit',
    textDecoration: 'none',
  },
  listItemIcon: {
    minWidth: 0,
    color: '#240b36', // TODO: define in theme/config somewhere
  },
  menuItemLink: {
    display: 'block',
    width: '100%',
    height: '100%',
    color: 'inherit',
  },
  label: {
    flex: 1,
    '& svg': {
      height: '1em',
    },
  },
  subMenuItem: {
    paddingLeft: '2rem',
  },
  mobileAccountMenu: {
    padding: '0.5rem',
  },
})

const NavigationLink = (props: any) => {
  const classes = useStyles()
  return <Link {...props} className={classes.menuItemLink} />
}

function MenuItemWithUrl({
  onClick,
  url,
  label,
  className = '',
}: {
  onClick: () => void
  url: string
  label: string
  className?: string
}) {
  const classes = useStyles()
  return (
    <NavigationLink
      className={`${classes.menuListLink} ${className}`}
      color="primary"
      variant="inherit"
      to={url}
      onClick={onClick}>
      <Typography component="div" style={{ display: 'flex' }}>
        <span className={classes.label}>{getLabelForMenuItem(label)}</span>
        <ListItemIcon className={classes.listItemIcon}>
          <ChevronRightIcon />
        </ListItemIcon>
      </Typography>
    </NavigationLink>
  )
}

export default () => {
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [, , userPreferences] = useUserPreferences()
  // @ts-ignore
  const isMenuOpen = useSelector(({ app }) => app.isMenuOpen)
  const dispatch = useDispatch()

  const dispatchCloseMenu = () => dispatch(closeMenu())

  const [openDropdownMenus, setOpenDropdownMenus] = useState<{
    [id: string]: boolean
  }>({})
  const onClickDropdownParentItem = (id: string) => {
    const newValue = openDropdownMenus[id] ? false : true

    setOpenDropdownMenus({
      ...openDropdownMenus,
      [id]: newValue,
    })

    if (newValue === true) {
      trackAction('MobileMenu', 'Expand dropdown menu', id)
    }
  }

  const onClickMenuItemWithUrl = () => {
    setOpenDropdownMenus({})
    dispatchCloseMenu()
  }

  return (
    <Drawer anchor="right" open={isMenuOpen} onClose={dispatchCloseMenu}>
      <div className={classes.content}>
        <div className={classes.mobileAccountMenu}>
          <AccountMenu isMobile onClose={dispatchCloseMenu} />
        </div>
        <Divider />
        <MenuList>
          {navItems
            .filter((navItem) =>
              canShowMenuItem(navItem, user, userPreferences)
            )
            .map(({ id, label, url, children }) => (
              <div key={id}>
                <MenuItem>
                  {children ? (
                    <Typography
                      component="div"
                      style={{ display: 'flex', width: '100%' }}
                      onClick={() => onClickDropdownParentItem(id)}>
                      <span>{getLabelForMenuItem(label)}</span>
                      <ListItemIcon className={classes.listItemIcon}>
                        {openDropdownMenus[id] ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </ListItemIcon>
                    </Typography>
                  ) : url ? (
                    <MenuItemWithUrl
                      url={url}
                      label={label}
                      onClick={onClickMenuItemWithUrl}
                    />
                  ) : null}
                </MenuItem>
                {openDropdownMenus[id]
                  ? !Array.isArray(children) && children
                    ? React.createElement(children, {
                        onClose: onClickMenuItemWithUrl,
                      })
                    : children
                    ? children
                        .filter((navItem) =>
                          canShowMenuItem(navItem, user, userPreferences)
                        )
                        .map((child) => (
                          <MenuItem
                            key={child.id}
                            className={classes.subMenuItem}>
                            {child.url ? (
                              <MenuItemWithUrl
                                url={child.url}
                                label={child.label}
                                onClick={onClickMenuItemWithUrl}
                              />
                            ) : (
                              '(no url)'
                            )}
                          </MenuItem>
                        ))
                    : null
                  : null}
              </div>
            ))}
        </MenuList>
      </div>
    </Drawer>
  )
}
