import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { matchPath, useLocation } from 'react-router'

import {
  changeSearchTerm,
  searchIndexNameLabels,
  overrideSearchFilter,
} from '../../modules/app'
import * as routes from '../../routes'
import { convertSearchTermToUrlPath } from '../../utils'
import { trackAction } from '../../analytics'
import useHistory from '../../hooks/useHistory'
import BigSearchInput from '../big-search-input'
import { CollectionNames as AssetsCollectionNames } from '../../modules/assets'
import { CollectionNames as AuthorsCollectionNames } from '../../modules/authors'
import { CollectionNames as UsersCollectionNames } from '../../modules/users'

function getPlaceholderForSearchIndexName(searchTableName: string): string {
  switch (searchTableName) {
    case AssetsCollectionNames.Assets:
      return 'Search'
    case AuthorsCollectionNames.Authors:
      return 'Search authors'
    case UsersCollectionNames.Users:
      return 'Search users'
    default:
      return '?'
  }
}

function updateUrlWithSearchData(indexName: string, searchTerm: string): void {
  window.history.replaceState(
    null,
    'Search',
    routes.searchWithVar
      .replace(
        ':indexName',
        (searchIndexNameLabels as any)[indexName as any] as any
      )
      .replace(':searchTerm', convertSearchTermToUrlPath(searchTerm))
  )
}

export default () => {
  const { searchTerm, searchTableName, isSearching } = useSelector(
    // @ts-ignore repair
    ({ app: { searchTerm, searchTableName, isSearching } }) => ({
      searchTerm,
      searchTableName,
      isSearching,
    })
  )
  const dispatch = useDispatch()
  const { push } = useHistory()
  const location = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)

  const onSearchTermInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTerm = event.target.value

    dispatch(changeSearchTerm(newTerm))

    trackAction('Searchbar', 'Change search term', newTerm)
  }

  useEffect(() => {
    if (!searchTerm) {
      return
    }

    const matchResult = matchPath<{ categoryName: string }>(location.pathname, {
      path: routes.viewCategoryWithVar,
      exact: true,
    })

    if (matchResult) {
      const categoryName = matchResult.params.categoryName
      dispatch(overrideSearchFilter(`category:${categoryName}`))
    }

    updateUrlWithSearchData(searchTableName, searchTerm)
  }, [searchTableName, searchTerm])

  const clearSearch = () => {
    inputRef.current!.value = ''
    dispatch(changeSearchTerm(''))
  }

  return (
    <BigSearchInput
      isSearching={isSearching}
      onClear={clearSearch}
      // input props
      inputRef={inputRef}
      onKeyDown={(e) => {
        if (e.keyCode === 27) {
          clearSearch()
          push(routes.home)
          trackAction('Searchbar', 'Press escape key to clear search input')
        } else if (e.keyCode === 13) {
          console.debug(`Pressed enter, forcing another search...`, {
            searchTableName,
            searchTerm,
          })
          const lastKnownSearchTerm = inputRef.current!.value

          if (lastKnownSearchTerm) {
            push(
              routes.searchWithVar
                .replace(':indexName', searchTableName)
                .replace(':searchTerm', lastKnownSearchTerm)
            )
            trackAction('Searchbar', 'Press enter key to perform search')
          } else {
            console.debug(`Search input has no value`)
          }
        }
      }}
      placeholder={getPlaceholderForSearchIndexName(searchTableName)}
      autoFocus={true}
      autoComplete="false"
      onChange={onSearchTermInputChange}
      defaultValue={searchTerm || ''}
    />
  )
}
