import { useCallback } from 'react'
import useDataStore from './useDataStore'
import { DataStoreErrorCode, GetQuery } from '../data-store'
import { SupabaseClient } from '@supabase/supabase-js'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

export type GetQueryFn<TRecord> = (
  query: GetQuery<TRecord>
) => GetQuery<TRecord>

export default <TRecord>(
  viewName: string,
  getQuery?: GetQueryFn<TRecord> | null,
  queryName?: string
): [
  boolean,
  null | DataStoreErrorCode,
  null | TRecord[],
  null | number,
  () => void
] => {
  const mainGetQuery = useCallback(
    (supabase: SupabaseClient): PostgrestFilterBuilder<any, any, TRecord[]> => {
      let query = supabase
        .from(viewName.toLowerCase())
        .select<string, TRecord>('*')

      if (getQuery) {
        // @ts-ignore idk
        query = getQuery(query)
      }

      return query
    },
    [viewName, getQuery]
  )
  const [isLoading, lastErrorCode, result, totalCount, hydrate] =
    useDataStore<TRecord>(mainGetQuery, queryName)
  return [isLoading, lastErrorCode, result, totalCount, hydrate]
}
