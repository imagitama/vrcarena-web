import { useCallback } from 'react'
import { DataStoreErrorCode, PlaylistsFieldNames } from '../data-store'
import useDataStore from './useDataStore'
import useUserId from './useUserId'
import { Collection } from '../modules/collections'
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
            .from('getPublicPlaylists'.toLowerCase())
            .select('*')
            .eq(PlaylistsFieldNames.createdBy, userId)
            .order(PlaylistsFieldNames.createdAt, { ascending: false })
        : null,
    [userId]
  )
  const states = useDataStore<Collection>(getQuery, 'my-collections')
  return states
}
