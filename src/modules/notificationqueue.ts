import { NotificationMethod } from '../notifications'
import { QueuedItemFailureInfo } from '../queues'
import { QueueStatus as NotificationQueuedItemStatus } from './common'

export { NotificationQueuedItemStatus }

export interface WebNotification<TData> {
  message: string
  data: TData | null
}

export interface EmailNotification {
  recipient?: {
    name?: string
    email?: string // fallback: userpref / signup email
  } // fallback: userpref / signup
  subject?: string // fallback: determine from eventname
  html?: string // fallback: text (or throw)
  text?: string // fallback: html (or throw)
}

export interface NotificationQueuedItem<TData = any>
  extends Record<string, any> {
  id: string // uuidv4
  // basics
  eventname: string
  recipient: string // id
  overridemethod: NotificationMethod | null
  webdetails: WebNotification<TData> | null
  emaildetails: EmailNotification | null
  // extra stuff
  parenttable: string | null
  parent: string | null
  // queue mechanism
  result: any // array of objects with IDs
  status: NotificationQueuedItemStatus
  notes: string | null // auto-cleared on status change
  failureinfo: QueuedItemFailureInfo<any> | null // auto-cleared on status change
  lastmodifiedat: string | null // date
  lastmodifiedby: string | null // id
  createdat: string // date
  createdby: string | null // id
}

export enum CollectionNames {
  NotificationQueue = 'notificationqueue',
}
