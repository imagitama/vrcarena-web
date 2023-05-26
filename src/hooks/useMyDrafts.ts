import { useCallback } from 'react'
import { client as supabase } from '../supabase'
import useUserId from './useUserId'
import useDataStore from './useDataStore'
import { AssetFieldNames } from './useDatabaseQuery'
import { FullAsset } from '../modules/assets'

export default (): [boolean, boolean, FullAsset[] | null] => {
  const userId = useUserId()
  const getQuery = useCallback(() => {
    return supabase
      .from('getDraftAssets'.toLowerCase())
      .select('*')
      .eq(AssetFieldNames.createdBy, userId)
  }, [])
  const [isLoading, isError, result] = useDataStore<FullAsset[]>(
    getQuery,
    'my-drafts'
  )
  return [isLoading, isError, result]
}
