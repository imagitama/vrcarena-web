import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@mui/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Badge from '@mui/material/Badge'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useLocation } from 'react-router'
import { SupabaseClient } from '@supabase/supabase-js'

import { getUserId } from '@/supabase'
import { trackAction } from '@/analytics'
import * as routes from '@/routes'
import { handleError } from '@/error-handling'
import { notifications as getItemsForNotifications } from './getItems'
import { deleteRecord } from '@/data-store'
import { CollectionNames } from '@/modules/notifications'

import useIsLoggedIn from '@/hooks/useIsLoggedIn'
import useUserId from '@/hooks/useUserId'
import useUserRecord from '@/hooks/useUserRecord'
import useSupabaseClient from '@/hooks/useSupabaseClient'

import Menu, { MenuItemData } from '@/components/menu'
import Button from '@/components/button'
import Avatar, { AvatarSize } from '@/components/avatar'
import classNames from 'classnames'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    '@media (max-width: 1300px)': {
      flexWrap: 'wrap',
      flexDirection: 'column-reverse',
    },
  },
  items: {
    display: 'flex',
    alignItems: 'center',
    '@media (max-width: 1300px)': {
      width: '100%',
      justifyContent: 'flex-end',
      '&:last-child': {
        marginBottom: '0.5rem',
      },
    },
  },
  item: {
    marginRight: '1rem',
    transition: 'all 100ms',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      fontSize: '150%',
    },
  },
  iconItem: {
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  mobileBtn: {
    width: '100%',
    marginRight: 0,
    marginBottom: '0.5rem',
    '& > *': {
      width: '100%',
    },
  },
  username: {
    marginLeft: '0.5rem',
  },
  loggedIn: {
    fontWeight: 'bold',
  },
  submitBtn: {
    '&&': {
      marginRight: '1rem',
      paddingRight: '0.25rem',
    },
    '& svg': {
      marginLeft: '-4px',
    },
  },
})

interface MenuItemDetails {
  label?: any
  icon?: any
  count?: null | number
  items?: MenuItemData[]
  getItems?: (supabase: SupabaseClient) => Promise<MenuItemData[]>
  onClick?: (id: string) => void | Promise<void>
  hideIfNone?: boolean
  loggedInOnly?: boolean
  noItemsMessage?: string
  onClear?: () => void | Promise<void>
  subscribe?: (callback: () => void) => void
  badge?: boolean
}

const AvatarMenuItem = () => {
  const classes = useStyles()
  const [, , user] = useUserRecord()

  return (
    <>
      <Avatar
        url={user && user.avatarurl ? user.avatarurl : undefined}
        username={user && user.username ? user.username : undefined}
        size={AvatarSize.Tiny}
      />
      <span
        className={classNames(classes.username, {
          [classes.loggedIn]: user !== null,
        })}>
        {user ? user.username : 'Logged out'}
      </span>
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
  supabase: SupabaseClient,
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
      await deleteRecord(supabase, CollectionNames.Notifications, id)
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

      await supabase
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
  const supabase = useSupabaseClient()

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

  const menu = getMenu(supabase, location.pathname, userId)

  const hydrateMenu = async (id: string) => {
    try {
      const menuDetails = menu[id]

      if (!menuDetails || !menuDetails.getItems) {
        return
      }

      console.debug(`Hydrating menu ${id}...`)

      const newItemsResult = await menuDetails.getItems(supabase)

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
    <div className={classes.root}>
      {isLoggedIn ? (
        <Button
          url={routes.createAsset}
          className={classNames(classes.submitBtn, {
            [classes.mobileBtn]: isMobile,
          })}
          onClick={closeAllDropdowns}
          icon={<ChevronRightIcon />}
          color="secondary"
          hollow>
          Submit
        </Button>
      ) : null}
      <div className={classes.items}>
        {Object.entries(menu)
          .filter(
            ([id, { hideIfNone, loggedInOnly }]: [string, MenuItemDetails]) => {
              if (loggedInOnly && !isLoggedIn) {
                return false
              }
              if (hideIfNone && (!menuItems[id] || !menuItems[id].length)) {
                return false
              }
              return true
            }
          )
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
                  badgeContent={
                    menuItems[id]
                      ? menuItems[id].filter(
                          (item) => item.includeInCount !== false
                        ).length
                      : null
                  }
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
                    ? [
                        {
                          id: 'no-items',
                          label: noItemsMessage,
                          disabled: true,
                        },
                      ]
                    : []
                }
                onClickItem={onClick}
                onRemove={() => hydrateMenu(id)}
              />
            )
          }
        )}
      </div>
    </div>
  )
}
