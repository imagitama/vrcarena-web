import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import Badge from '@material-ui/core/Badge'
import EditIcon from '@material-ui/icons/Edit'
import NotificationsIcon from '@material-ui/icons/Notifications'
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart'
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn'

import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import { trackAction } from '../../analytics'
import * as routes from '../../routes'
import Menu, { MenuItemData } from '../menu'
import Button from '../button'
import useUserRecord from '../../hooks/useUserRecord'
import { CollectionNames, UserFieldNames } from '../../hooks/useDatabaseQuery'
import Avatar, { sizes } from '../avatar'
import useUserId from '../../hooks/useUserId'
import { useLocation } from 'react-router'
import { handleError } from '../../error-handling'
import {
  cart as getItemsForCart,
  queue as getItemsForQueue,
  notifications as getItemsForNotifications,
} from './getItems'
import { deleteRecord } from '../../data-store'
import { cartIdsStorageKey, clear as clearCart } from '../../cart'
import { client, getUserId } from '../../supabase'

const useStyles = makeStyles({
  items: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  item: {
    marginRight: '1rem',
    transition: 'all 100ms',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  iconItem: {
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  mobileButton: {
    width: '100%',
    marginRight: 0,
    marginBottom: '0.5rem',
    '& > *': {
      width: '100%',
    },
  },
})

interface MenuItemDetails {
  label?: any
  icon?: any
  count?: null | number
  items?: MenuItemData[]
  getItems?: () => Promise<MenuItemData[]>
  onClick?: (id: string) => void | Promise<void>
  hideIfNone?: boolean
  loggedInOnly?: boolean
  noItemsMessage?: string
  onClear?: () => void | Promise<void>
  subscribe?: (callback: () => void) => void
  badge?: boolean
}

const AvatarMenuItem = () => {
  const [, , user] = useUserRecord()

  return (
    <>
      <Avatar
        url={user && user.avatarurl ? user.avatarurl : undefined}
        size={sizes.TINY}
      />
      <KeyboardArrowDownIcon />
    </>
  )
}

const getLoggedInMenuItems = (currentPath: string, userId: string) => [
  {
    id: 'my-account',
    url: routes.myAccount,
    label: 'My Account',
  },
  {
    id: 'my-profile',
    url: routes.viewUserWithVar.replace(':userId', userId),
    label: 'My Profile',
  },
  {
    id: 'sign-out',
    url: routes.logoutWithVar.replace(':currentPath', currentPath),
    label: 'Logout',
  },
]

const getLoggedOutMenuItems = (currentPath: string) => [
  {
    id: 'login',
    url: routes.loginWithVar.replace(':currentPath', currentPath),
    label: 'Log In',
  },
  {
    id: 'sign-up',
    url: routes.signUp,
    label: 'Sign Up',
  },
]

const getMenu = (
  currentPath: string,
  userId: string | null
): { [id: string]: MenuItemDetails } => ({
  notifications: {
    icon: NotificationsIcon,
    count: null,
    getItems: getItemsForNotifications,
    onClick: async (id) => {
      if (id === 'clear-all') {
        return
      }
      console.debug(`Clicked notification ${id}...`)
      await deleteRecord(CollectionNames.Notifications, id)
    },
    loggedInOnly: true,
    noItemsMessage: 'No notifications',
    onClear: async () => {
      const userId = getUserId()

      if (!userId) {
        console.debug(`No user ID!`)
        return
      }

      console.debug(`Clearing all notifications...`)

      await client
        .from(CollectionNames.Notifications)
        .delete()
        .eq('recipient', userId)
    },
    subscribe: (callback) => {
      setInterval(() => {
        callback()
      }, 30 * 60 * 1000) // 30 seconds
    },
  },
  queue: {
    icon: AssignmentTurnedInIcon,
    getItems: getItemsForQueue,
    hideIfNone: true,
    loggedInOnly: true,
  },
  cart: {
    icon: ShoppingCartIcon,
    getItems: getItemsForCart,
    noItemsMessage: 'No assets in your cart',
    onClear: () => {
      clearCart()
    },
    subscribe: (callback) => {
      window.addEventListener(
        'onLocalStorageChange',
        ({ detail: { key } }: any) => {
          if (key === cartIdsStorageKey) {
            callback()
          }
        }
      )
    },
  },
  user: {
    badge: false,
    label: <AvatarMenuItem />,
    items: userId
      ? getLoggedInMenuItems(currentPath, userId)
      : getLoggedOutMenuItems(currentPath),
  },
})

export default ({
  isMobile = false,
  onClose = undefined,
}: {
  isMobile?: boolean
  onClose?: () => void
}) => {
  const isLoggedIn = useIsLoggedIn()
  const userId = useUserId()
  const [openId, setOpenId] = useState<string | null>(null)
  const classes = useStyles()
  const buttonRefs = useRef<{ [id: string]: HTMLDivElement }>({})
  const location = useLocation()
  const [menuItems, setMenuItems] = useState<{ [id: string]: MenuItemData[] }>(
    {}
  )

  const toggleMenu = (id: string) => {
    if (openId === id) {
      closeAllDropdowns()
    } else {
      setOpenId(id)
      trackAction('AccountMenu', 'Open dropdown', id)
    }
  }

  const closeAllDropdowns = () => {
    setOpenId(null)
    if (onClose) {
      onClose()
    }
  }

  const menu = getMenu(location.pathname, userId)

  const hydrateMenu = async (id: string) => {
    try {
      const menuDetails = menu[id]

      if (!menuDetails || !menuDetails.getItems) {
        return
      }

      console.debug(`Hydrating menu ${id}...`)

      const newItemsResult = await menuDetails.getItems()

      setMenuItems((currentItems) => ({
        ...currentItems,
        [id]: newItemsResult,
      }))
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  useEffect(() => {
    for (const id in menu) {
      ;(async () => {
        try {
          const menuDetails = menu[id]

          hydrateMenu(id)

          if (menuDetails.subscribe) {
            menuDetails.subscribe(() => {
              hydrateMenu(id)
            })
          }
        } catch (err) {
          console.error(err)
          handleError(err)
        }
      })()
    }
  }, [isLoggedIn])

  return (
    <div className={classes.items}>
      {isLoggedIn ? (
        <>
          <Button
            url={routes.social}
            className={`${classes.item} ${
              isMobile ? classes.mobileButton : ''
            }`}
            onClick={closeAllDropdowns}
            color="default"
            icon={<EditIcon />}>
            Post
          </Button>{' '}
          <Button
            url={routes.createAsset}
            className={`${classes.item} ${
              isMobile ? classes.mobileButton : ''
            }`}
            onClick={closeAllDropdowns}>
            Upload
          </Button>
        </>
      ) : null}
      {Object.entries(menu)
        .filter(([id, { hideIfNone, loggedInOnly }]) => {
          if (loggedInOnly && !isLoggedIn) {
            return false
          }
          if (hideIfNone && (!menuItems[id] || !menuItems[id].length)) {
            return false
          }
          return true
        })
        .map(([id, { label, icon: Icon, badge }]) => (
          <div
            key={id}
            ref={(elem) => {
              if (!elem) {
                return
              }
              buttonRefs.current[id] = elem
            }}
            className={classes.item}
            onClick={() => toggleMenu(id)}>
            {badge !== false ? (
              <Badge
                badgeContent={menuItems[id] ? menuItems[id].length : null}
                color="primary">
                {label ? label : Icon ? <Icon /> : null}
              </Badge>
            ) : (
              label
            )}
          </div>
        ))}
      {Object.entries(menu).map(
        ([id, { items, onClick, noItemsMessage, onClear }]) => {
          const clearItem = {
            id: 'clear-all',
            onClick: async () => {
              if (!onClear) {
                return
              }

              await onClear()

              hydrateMenu(id)
            },
            label: 'Clear All',
          }
          return (
            <Menu
              key={id}
              isOpen={openId === id}
              buttonRef={buttonRefs.current[id]}
              onClose={() => closeAllDropdowns()}
              items={
                items
                  ? items.concat(onClear ? [clearItem] : [])
                  : menuItems[id] && menuItems[id].length
                  ? menuItems[id].concat(onClear ? [clearItem] : [])
                  : noItemsMessage
                  ? [{ id: 'no-items', label: noItemsMessage, disabled: true }]
                  : []
              }
              onClickItem={onClick}
              onRemove={() => hydrateMenu(id)}
            />
          )
        }
      )}
    </div>
  )
}
