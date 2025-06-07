import { FullAmendment } from './amendments'
import { SmallAsset } from './assets'
import { PublicAvatarSubmission } from './public-avatar-submissions'
import { FullReport } from './reports'

export enum AdminQueueItemType {
  Asset = 'asset',
  Amendment = 'amendment',
  Report = 'report',
  Avatar = 'avatar',
}

export interface AdminQueueItemBase {
  id: number
  type: AdminQueueItemType
  record: SmallAsset | FullAmendment | FullReport | PublicAvatarSubmission
  createdat: string
}

export interface AssetAdminQueueItem extends AdminQueueItemBase {
  type: AdminQueueItemType.Asset
  record: SmallAsset
}
export interface AmendmentAdminQueueItem extends AdminQueueItemBase {
  type: AdminQueueItemType.Amendment
  record: FullAmendment
}
export interface ReportAdminQueueItem extends AdminQueueItemBase {
  type: AdminQueueItemType.Report
  record: FullReport
}
export interface AvatarAdminQueueItem extends AdminQueueItemBase {
  type: AdminQueueItemType.Avatar
  record: PublicAvatarSubmission
}

export type AdminQueueItem =
  | AssetAdminQueueItem
  | AmendmentAdminQueueItem
  | ReportAdminQueueItem
  | AvatarAdminQueueItem

export enum ViewNames {
  GetAdminQueue = 'getadminqueue',
}
