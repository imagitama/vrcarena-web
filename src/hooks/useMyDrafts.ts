import { useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import { FullAsset, ViewNames } from '@/modules/assets'
import useUserId from './useUserId'
import useDataStore from './useDataStore'
import { DataStoreErrorCode } from '@/data-store'

export default (): [boolean, null | DataStoreErrorCode, FullAsset[] | null] => {
  const userId = useUserId()
  const getQuery = useCallback((supabase: SupabaseClient) => {
    return supabase
      .from(ViewNames.GetDraftAssets)
      .select('*')
      .eq('createdby', userId)
  }, [])
  const [isLoading, lastErrorCode, result] = useDataStore<FullAsset>(
    getQuery,
    'my-drafts'
  )
  return [isLoading, lastErrorCode, result]
}
