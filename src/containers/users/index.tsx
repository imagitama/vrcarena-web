import React, { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router'

import * as routes from '../../routes'
import UserList from '../../components/user-list'
import Heading from '../../components/heading'
import PaginatedView, { GetQueryFn } from '../../components/paginated-view'
import Button from '../../components/button'
import { trackAction } from '../../analytics'
import { changeSearchTableName } from '../../modules/app'
import { User, CollectionNames, ViewNames } from '../../modules/users'

const sortKey = 'view-users'
const analyticsCategory = 'view-users'

const Renderer = ({ items }: { items?: User[] }) => <UserList users={items!} />

enum SubView {
  ALL = 'all',
  STAFF = 'staff',
  BANNED = 'banned',
}

export default () => {
  const location = useLocation()
  const [selectedSubView, setSelectedSubView] = useState(
    location.pathname.includes('staff') ? SubView.STAFF : SubView.ALL
  )
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(changeSearchTableName(CollectionNames.Users))
  }, [])

  const toggleSubView = (subView: SubView): void =>
    setSelectedSubView((currentVal) => {
      if (currentVal === subView) {
        return SubView.ALL
      }
      return subView
    })

  const getQuery = useCallback<GetQueryFn<User>>(
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
        viewName={
          selectedSubView === SubView.STAFF ? ViewNames.GetStaffUsers : ''
        }
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
              selectedSubView === SubView.STAFF ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )
            }
            onClick={() => {
              toggleSubView(SubView.STAFF)

              trackAction(
                analyticsCategory,
                'Click on only show staff users button'
              )
            }}
            color="secondary">
            Staff
          </Button>,
        ]}
        urlWithPageNumberVar={routes.viewUsersWithPageNumberVar}>
        <Renderer />
      </PaginatedView>
    </>
  )
}
