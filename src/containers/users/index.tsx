import React, { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router'

import * as routes from '../../routes'
import UserList from '../../components/user-list'
import Heading from '../../components/heading'
import PaginatedView from '../../components/paginated-view'
import Button from '../../components/button'
import { trackAction } from '../../analytics'
import { changeSearchTableName } from '../../modules/app'
import { User, CollectionNames } from '../../modules/users'

const sortKey = 'view-users'
const analyticsCategory = 'view-users'

const Renderer = ({ items }: { items?: User[] }) => <UserList users={items!} />

const subViews = {
  ALL: 'all',
  STAFF: 'staff',
  BANNED: 'banned',
}

export default () => {
  const location = useLocation()
  const [selectedSubView, setSelectedSubView] = useState(
    location.pathname.includes('staff') ? subViews.STAFF : subViews.ALL
  )
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(changeSearchTableName(CollectionNames.Users))
  }, [])

  const toggleSubView = (subView: string): void =>
    setSelectedSubView((currentVal) => {
      if (currentVal === subView) {
        return subViews.ALL
      }
      return subView
    })

  const getQuery = useCallback(
    (query) => query.gt('username', ''),
    [selectedSubView]
  )

  return (
    <>
      <Helmet>
        <title>
          View a list of users that are signed up on the site | VRCArena
        </title>
        <meta
          name="description"
          content={`Find every user that has signed up to VRCArena.`}
        />
      </Helmet>
      <Heading variant="h1">Users</Heading>
      <PaginatedView<User>
        viewName={selectedSubView === subViews.STAFF ? 'getStaffUsers' : ''}
        collectionName={CollectionNames.Users}
        select={`id, username, avatarurl`}
        getQuery={getQuery}
        sortKey={sortKey}
        sortOptions={[
          {
            label: 'Sign up date',
            fieldName: 'createdat',
          },
          {
            label: 'Username',
            fieldName: 'username',
          },
        ]}
        defaultFieldName="createdat"
        extraControls={[
          <Button
            icon={
              selectedSubView === subViews.STAFF ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )
            }
            onClick={() => {
              toggleSubView(subViews.STAFF)

              trackAction(
                analyticsCategory,
                'Click on only show staff users button'
              )
            }}
            color="default">
            Staff
          </Button>,
        ]}
        urlWithPageNumberVar={routes.viewUsersWithPageNumberVar}>
        <Renderer />
      </PaginatedView>
    </>
  )
}
