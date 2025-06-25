import { PopularCurrency } from '../currency'
import { Asset, CollectionNames as AssetsCollectionNames } from './assets'

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

export enum QueueStatus {
  Queued = 'queued',
  Processing = 'processing',
  Processed = 'processed',
  Failed = 'failed',
}

export interface AuditQueueItem extends Record<string, unknown> {
  id: string
  status: QueueStatus
  parent: string
  parenttable: AssetsCollectionNames.Assets
  url: string
  result: AuditResult | null
  failedreason: string | null
  lastmodifiedat: string // date
  queuedat: string // date
  queuedby: string | null
}

export interface FullAuditQueueItem extends AuditQueueItem {
  applystatus: QueueStatus | null
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
