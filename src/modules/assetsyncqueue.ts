import { QueueStatus } from './common'

export { QueueStatus }

export interface AssetSyncQueueItemFields extends Record<string, unknown> {
  sourceurl: string
}

export interface AssetSyncQueueItem extends AssetSyncQueueItemFields {
  id: string
  status: QueueStatus
  failedreason: string
  syncedfields: string[] | null
  createdassetid: string
  lastmodifiedby: string
  lastmodifiedat: string
  createdby: string
  createdat: string
}

export interface FullAssetSyncQueueItem extends AssetSyncQueueItem {
  createdbyusername: string
  lastmodifiedbyusername: string
}

export enum CollectionNames {
  AssetSyncQueue = 'assetsyncqueue',
}
