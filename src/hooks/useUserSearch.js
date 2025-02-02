import { useCallback, useState, useEffect, useRef } from 'react'
import useDataStore from './useDataStore'

const defaultLimit = 50

const cleanupSearchTerm = (searchTerm) => (searchTerm ? searchTerm.trim() : '')

export const getQuery = (
  searchTerm,
  filtersByFieldName,
  limit = defaultLimit
) => {
  if (!searchTerm) {
    return false
  }

  let query = supabase
    .rpc('searchusers', {
      searchterm: searchTerm.split(' ').join('&'),
    })
    .select('*')
    .limit(limit)

  for (const [fieldName, values] of Object.entries(filtersByFieldName)) {
    query = query.or(
      values.map((value) => `${fieldName}.eq.${value}`).join(',')
    )
  }

  return query
}

export default (searchTerm, filtersByFieldName = {}, limit = defaultLimit) => {
  const [actualSearchTerm, setActualSearchTerm] = useState('')
  const timerRef = useRef()

  useEffect(() => {
    clearTimeout(timerRef.current)

    timerRef.current = setTimeout(
      () => setActualSearchTerm(cleanupSearchTerm(searchTerm)),
      500
    )

    return () => {
      clearTimeout(timerRef.current)
    }
  }, [searchTerm])

  const getQueryForHook = useCallback(
    (supabase) =>
      getQuery(supabase, actualSearchTerm, filtersByFieldName, limit),
    [
      actualSearchTerm,
      Object.keys(filtersByFieldName).join('+'),
      Object.values(filtersByFieldName).join('+'),
      limit,
    ]
  )

  const [isLoading, lastErrorCode, value] = useDataStore(
    getQueryForHook,
    'user-search'
  )

  return [isLoading, lastErrorCode, value]
}
