import { useCallback } from 'react'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { client as supabase } from '../supabase'
import useDataStore from './useDataStore'

export default <TResult, TItem = any>(
  viewName: string,
  getQuery?:
    | null
    | ((query: PostgrestFilterBuilder<TItem>) => PostgrestFilterBuilder<TItem>),
  queryName?: string
): [boolean, boolean, null | TResult, null | number, () => void] => {
  const mainGetQuery = useCallback(() => {
    let query = supabase.from(viewName.toLowerCase()).select('*')

    if (getQuery) {
      query = getQuery(query)
    }

    return query
  }, [viewName, getQuery])
  const [isLoading, isError, result, totalCount, hydrate] =
    useDataStore<TResult>(mainGetQuery, queryName)
  return [isLoading, isError, result, totalCount, hydrate]
}
