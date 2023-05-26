import React from 'react'
import { useLocation } from 'react-router'

import { CollectionNames, UserFieldNames } from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useUserRecord from '../../hooks/useUserRecord'

import FavoriteSpeciesEditor from '../favorite-species-editor'
import Paper from '../paper'
import Heading from '../heading'
import * as routes from '../../routes'
import useDataStoreItem from '../../hooks/useDataStoreItem'

export default () => {
  const userId = useUserId()
  const username = useUserRecord(UserFieldNames.username)
  const [, , profile] = useDataStoreItem(
    CollectionNames.Users,
    userId ? userId : false,
    'set-fav-species'
  )
  const { pathname } = useLocation()

  if (pathname == routes.setupProfile) {
    return null
  }

  // if logged out OR havent setup profile yet
  if (!userId || !profile || !username) {
    return null
  }

  // null if they choose to skip
  if (
    profile &&
    (profile[UserFieldNames.favoriteSpecies] ||
      profile[UserFieldNames.favoriteSpecies] === null)
  ) {
    return null
  }

  return (
    <Paper>
      <Heading variant="h2" noTopMargin>
        Favorite Species
      </Heading>
      <FavoriteSpeciesEditor analyticsCategoryName="Global" />
    </Paper>
  )
}
