import { QueuedItem } from "../queues"

export interface AuditApplyQueueItem<TRecord> extends QueuedItem {
  auditqueueitem: string // auditqueue id
  old: TRecord
  new: TRecord
}

export enum CollectionNames {
  AuditApplyQueue = 'auditapplyqueue',
}
