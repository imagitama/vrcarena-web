import { useCallback } from 'react'
import { client as supabase } from '../supabase'
import useUserId from './useUserId'
import useDataStore, { ErrorCode } from './useDataStore'
import { AssetFieldNames } from './useDatabaseQuery'
import { FullAsset } from '../modules/assets'

export default (): [boolean, null | ErrorCode, FullAsset[] | null] => {
  const userId = useUserId()
  const getQuery = useCallback(() => {
    return supabase
      .from('getDraftAssets'.toLowerCase())
      .select('*')
      .eq(AssetFieldNames.createdBy, userId)
  }, [])
  const [isLoading, lastErrorCode, result] = useDataStore<FullAsset[]>(
    getQuery,
    'my-drafts'
  )
  return [isLoading, lastErrorCode, result]
}
