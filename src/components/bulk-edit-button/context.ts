import { createContext, useContext } from 'react'
import { Asset, FullAsset } from '../../modules/assets'
import type { BulkAction } from './'

interface Context {
  ids: null | string[]
  assets: Asset[]
  newData: { [assetId: string]: Partial<Asset> } & { all: Partial<Asset> }
  setNewData: (newData: { [assetId: string]: Partial<Asset> } & { all: Partial<Asset> }) => void
  selectedBulkAction: BulkAction
}

// @ts-ignore
export const context = createContext<Context>()

export const useBulkEdit = () => useContext(context)
