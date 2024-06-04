import { useCallback, useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { AssetFieldNames } from './useDatabaseQuery'
import useIsAdultContentEnabled from './useIsAdultContentEnabled'
import useDataStore, { ErrorCode } from './useDataStore'
import { client as supabase } from '../supabase'
import { setIsSearching } from '../modules/app'
import { Asset } from '../modules/assets'

const defaultLimit = 50

// backslash is an escape symbol
const cleanupSearchTerm = (searchTerm: string): string =>
  searchTerm ? searchTerm.trim().replaceAll('\\', '').replaceAll("'", "''") : ''

// fix some weird issue on Sentry where the entire URL is dumped into the search term
const validateSearchTerm = (searchTerm: string): boolean =>
  !!searchTerm && !searchTerm.includes('http')

export default (
  searchTerm: string,
  filtersByFieldName: { [fieldName: string]: string[] } = {},
  limit = defaultLimit
): [boolean, null | ErrorCode, Asset[] | null] => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [actualSearchTerm, setActualSearchTerm] = useState<string>('')
  const timerRef = useRef<NodeJS.Timeout>()
  const dispatch = useDispatch()

  useEffect(() => {
    const newSearchTerm = cleanupSearchTerm(searchTerm)

    // handle filter change without a term
    if (actualSearchTerm === newSearchTerm && !newSearchTerm) {
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => setActualSearchTerm(newSearchTerm), 500)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [searchTerm])

  const getQuery = useCallback(() => {
    if (!validateSearchTerm(actualSearchTerm)) {
      return false
    }

    let query = supabase
      .rpc('searchassets', {
        searchterm: actualSearchTerm.split(' ').join('&'),
      })
      .select('*')
      .limit(limit)
      .order('rank', {
        ascending: false,
      })

    if (!isAdultContentEnabled) {
      query = query.is(AssetFieldNames.isAdult, false)
    }

    for (const [fieldName, values] of Object.entries(filtersByFieldName)) {
      query = query.or(
        values.map((value) => `${fieldName}.eq.${value}`).join(',')
      )
    }

    return query
  }, [
    actualSearchTerm,
    isAdultContentEnabled,
    Object.keys(filtersByFieldName).join('+'),
    Object.values(filtersByFieldName).join('+'),
  ])

  const [isLoading, lastErrorCode, value] = useDataStore<Asset[]>(getQuery)

  useEffect(() => {
    dispatch(setIsSearching(isLoading))
  }, [isLoading])

  return [isLoading, lastErrorCode, value]
}
