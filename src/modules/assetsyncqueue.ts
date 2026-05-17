import { QueuedItem } from '@/queues'
import { QueueStatus } from './common'

export { QueueStatus }

export interface AssetSyncQueueItemFields extends QueuedItem {
  sourceurl: string
}

export interface AssetSyncQueueItem extends AssetSyncQueueItemFields {
  syncedfields: string[] | null
  createdassetid: string
}

export interface FullAssetSyncQueueItem extends AssetSyncQueueItem {
  createdbyusername: string
  lastmodifiedbyusername: string
}

export enum CollectionNames {
  AssetSyncQueue = 'assetsyncqueue',
}
