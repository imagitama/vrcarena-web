import { PopularCurrency } from '@/currency'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
  SourceInfo,
} from './assets'
import { QueuedItem } from '@/queues'
import { QueueStatus } from './common'

// TODO: use strings
export enum AuditResultResult {
  Success,
  Unavailable,
  Missing,
  Failed, // some issue trying to audit
}

export enum AuditErrorCode {
  FailedToDeterminePlatform = 'failedtodetermineplatform',
  Status404 = 'status404',
  Timeout = 'timeout',
  InvalidProductUrl = 'invalidproducturl',
}

export interface AuditResult {
  sourceurl: string
  actualurl?: string
  result: AuditResultResult
  price: number | null
  pricecurrency: PopularCurrency | null
  code?: AuditErrorCode
}

export interface AuditQueueItem extends QueuedItem {
  parent: string
  parenttable: AssetsCollectionNames.Assets
  url: string
  result: AuditResult | null
}

export interface FullAuditQueueItem extends AuditQueueItem {
  applystatus: QueueStatus | null // from view
  old: Partial<Asset | SourceInfo> | null
  new: Partial<Asset | SourceInfo> | null
}

export interface AuditQueueItemsByAsset {
  id: string // asset ID
  asset: Asset
  items: FullAuditQueueItem[]
  lastmodifiedat: Date | null
}

export enum ViewNames {
  GetAuditQueueItemsByAsset = 'getauditqueueitemsbyasset',
}

export enum CollectionNames {
  AuditQueue = 'auditqueue',
}

export { QueueStatus }