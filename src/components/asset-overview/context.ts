import { createContext } from 'react'
import { FullAsset, FullAssetEditor, FullAssetExtra } from '@/modules/assets'

export interface AssetOverviewContext {
  assetId: string
  asset: FullAsset | null | false
  assetExtra: FullAssetExtra | null
  assetEditorData: FullAssetEditor | null
  isLoading: boolean
  trackAction: (action: string, payload: any) => void
  hydrate: () => void
  analyticsCategoryName: string
}

// @ts-ignore
export default createContext<AssetOverviewContext>()
