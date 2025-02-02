import { useCallback } from 'react'
import useUserId from './useUserId'
import useDataStore from './useDataStore'
import { AssetFieldNames } from './useDatabaseQuery'
import { FullAsset } from '../modules/assets'
import { DataStoreErrorCode } from '../data-store'
import { SupabaseClient } from '@supabase/supabase-js'

export default (): [boolean, null | DataStoreErrorCode, FullAsset[] | null] => {
  const userId = useUserId()
  const getQuery = useCallback((supabase: SupabaseClient) => {
    return supabase
      .from('getDraftAssets'.toLowerCase())
      .select('*')
      .eq(AssetFieldNames.createdBy, userId)
  }, [])
  const [isLoading, lastErrorCode, result] = useDataStore<FullAsset>(
    getQuery,
    'my-drafts'
  )
  return [isLoading, lastErrorCode, result]
}
