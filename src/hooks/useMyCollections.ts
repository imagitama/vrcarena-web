import { useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import { DataStoreErrorCode } from '@/data-store'
import { FullCollection, ViewNames } from '@/modules/collections'

import useDataStore, { HydrateFn } from './useDataStore'
import useUserId from './useUserId'

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
