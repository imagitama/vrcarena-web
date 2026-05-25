import { QueuedItem } from '@/queues'
import { QueueStatus } from './common'
import { Asset } from './assets'

export { QueueStatus }

export interface AssetSyncQueueItemFields extends QueuedItem {
  sourceurl: string
  intent: Intent
}

export interface FieldsData {
  authorName: string | null
}

export interface AssetSyncResult {
  fields: Partial<Asset>,
  fieldsData: FieldsData
}

export enum Intent {
  CreateAsset = 'create_asset',
  EditAsset = 'edit_asset',
}

export interface AssetSyncQueueItem extends AssetSyncQueueItemFields {
  result: AssetSyncResult | null
  createdassetid: string | null
  // @deprecated
  syncedfields: string[] | null
}

export interface FullAssetSyncQueueItem extends AssetSyncQueueItem {
  createdbyusername: string
  lastmodifiedbyusername: string
}

export enum CollectionNames {
  AssetSyncQueue = 'assetsyncqueue',
}
