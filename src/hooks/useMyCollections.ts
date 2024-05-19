import { useCallback } from 'react'
import { client as supabase } from '../supabase'
import { PlaylistsFieldNames } from '../data-store'
import useDataStore from './useDataStore'
import useUserId from './useUserId'
import { Collection } from '../modules/collections'

export default (): [
  boolean,
  boolean,
  Collection[] | null,
  number | null,
  () => void,
  boolean
] => {
  const userId = useUserId()
  const getQuery = useCallback(
    () =>
      userId
        ? supabase
            .from('getPublicPlaylists'.toLowerCase())
            .select('*')
            .eq(PlaylistsFieldNames.createdBy, userId)
            .order(PlaylistsFieldNames.createdAt, { ascending: false })
        : false,
    [userId]
  )
  const states = useDataStore<Collection[]>(getQuery, 'my-collections')
  return states
}
