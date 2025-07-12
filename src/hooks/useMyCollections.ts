import { useCallback } from 'react'
import { DataStoreErrorCode } from '../data-store'
import useDataStore, { HydrateFn } from './useDataStore'
import useUserId from './useUserId'
import { FullCollection, ViewNames } from '../modules/collections'
import { SupabaseClient } from '@supabase/supabase-js'

export default (): [
  boolean,
  null | DataStoreErrorCode,
  FullCollection[] | null,
  number | null,
  HydrateFn,
  boolean
] => {
  const userId = useUserId()
  const getQuery = useCallback(
    (supabase: SupabaseClient) =>
      userId
        ? supabase
            .from(ViewNames.GetFullCollections)
            .select('*')
            .eq('createdby', userId)
            .order('createdat', { ascending: false })
        : null,
    [userId]
  )
  const states = useDataStore<FullCollection>(getQuery, 'my-collections')
  return states
}
