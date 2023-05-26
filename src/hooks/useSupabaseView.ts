import { useCallback } from 'react'
// @ts-ignore
import { SupabaseQueryBuilder } from '@supabase/supabase-js'
import { client as supabase } from '../supabase'
import useDataStore from './useDataStore'

export default <TResult>(
  viewName: string,
  getQuery?:
    | null
    | ((query: SupabaseQueryBuilder<any>) => SupabaseQueryBuilder<any>),
  queryName?: string
): [boolean, boolean, null | TResult, null | number, () => void] => {
  const mainGetQuery = useCallback(() => {
    let query = supabase.from(viewName.toLowerCase()).select('*')

    if (getQuery) {
      query = getQuery(query)
    }

    return query
  }, [viewName, getQuery])
  const [isLoading, isError, result, totalCount, hydrate] = useDataStore<
    TResult
  >(mainGetQuery, queryName)
  return [isLoading, isError, result, totalCount, hydrate]
}
