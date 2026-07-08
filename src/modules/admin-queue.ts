import { FullAmendment } from './amendments'
import { SmallAsset } from './assets'
import {
  FullPublicAvatarSubmission,
  PublicAvatarSubmission,
} from './public-avatar-submissions'
import { FullReport } from './reports'

export enum AdminQueueItemType {
  Asset = 'asset',
  Amendment = 'amendment',
  Report = 'report',
  Avatar = 'avatar',
}

export interface AdminQueueItemBase<T> {
  id: number
  type: AdminQueueItemType
  record: T
  createdat: string
}

export interface AssetAdminQueueItem extends AdminQueueItemBase<SmallAsset> {
  type: AdminQueueItemType.Asset
}
export interface AmendmentAdminQueueItem
  extends AdminQueueItemBase<FullAmendment<any>> {
  type: AdminQueueItemType.Amendment
}
export interface ReportAdminQueueItem extends AdminQueueItemBase<FullReport> {
  type: AdminQueueItemType.Report
}
export interface AvatarAdminQueueItem
  extends AdminQueueItemBase<FullPublicAvatarSubmission> {
  type: AdminQueueItemType.Avatar
}

export type AdminQueueItem =
  | AssetAdminQueueItem
  | AmendmentAdminQueueItem
  | ReportAdminQueueItem
  | AvatarAdminQueueItem

export enum ViewNames {
  GetAdminQueue = 'getadminqueue',
}
