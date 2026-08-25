import React, { useCallback, useEffect } from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router'

import * as routes from '@/routes'
import { changeSearchTableName } from '@/slices/app'
import {
  User,
  CollectionNames,
  ViewNames,
  UserForList,
  UserRoles,
} from '@/modules/users'

import UserList from '@/components/user-list'
import Heading from '@/components/heading'
import PaginatedView, { GetQueryFn } from '@/components/paginated-view'
import store from '@/store'

const sortKey = 'view-users'

const Renderer = ({ items }: { items?: User[] }) => <UserList users={items!} />

enum SubView {
  ALL = 'all',
  STAFF = 'staff',
  BANNED = 'banned',
}

export default () => {
  const location = useLocation()
  const isStaff = location.pathname.includes('staff')

  const dispatch = useDispatch<typeof store.dispatch>()

  useEffect(() => {
    dispatch(changeSearchTableName(CollectionNames.Users))
  }, [])

  const getQuery = useCallback<GetQueryFn<UserForList, SubView>>(
    (query, selectedSubView, activeFilters) => {
      if (selectedSubView === SubView.STAFF) {
        query = query.or(
          `role.eq.${UserRoles.Editor},role.eq.${UserRoles.Admin}`
        )
      }

      return query
    },
    []
  )

  return (
    <>
      <Helmet>
        <title>View a list of users that are signed up on the site</title>
        <meta
          name="description"
          content={`Find every user that has signed up to VRCArena.`}
        />
      </Helmet>
      <Heading variant="h1">Users</Heading>
      <PaginatedView<UserForList>
        viewName={ViewNames.GetUsersForList}
        name={sortKey}
        getQuery={getQuery}
        subViews={[
          {
            id: SubView.STAFF,
            label: 'Staff',
          },
        ]}
        defaultSubView={isStaff ? SubView.STAFF : undefined}
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
        urlWithSubViewNameAndPageNumberVar={routes.viewUsersWithPageNumberVar}>
        <Renderer />
      </PaginatedView>
    </>
  )
}
