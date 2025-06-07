import { useCallback } from 'react'
import { DataStoreErrorCode } from '../data-store'
import useDataStore from './useDataStore'
import useUserId from './useUserId'
import { Collection, ViewNames } from '../modules/collections'
import { SupabaseClient } from '@supabase/supabase-js'

export default (): [
  boolean,
  null | DataStoreErrorCode,
  Collection[] | null,
  number | null,
  () => void,
  boolean
] => {
  const userId = useUserId()
  const getQuery = useCallback(
    (supabase: SupabaseClient) =>
      userId
        ? supabase
            .from(ViewNames.GetPublicCollections)
            .select('*')
            .eq('createdby', userId)
            .order('createdat', { ascending: false })
        : null,
    [userId]
  )
  const states = useDataStore<Collection>(getQuery, 'my-collections')
  return states
}
