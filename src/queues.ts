import { QueueStatus } from "./modules/common"

export interface QueuedItemForRecord extends QueuedItem {
  recordtable: string
  recordid: string
}

export interface QueuedItem extends Record<string, unknown> {
  id: string // uuidv4
  status: QueueStatus
  notes: string | null
  failureinfo: QueuedItemFailureInfo<any> | null
  createdat: string // date
  createdby: string | null
  lastmodifiedat: string // date
  lastmodifiedby: string | null
}

export interface QueuedItemFailureInfo<TData> {
  code: string
  error: string // error constructor name
  message: string // user friendly message outputted to user to help them understand
  data: TData | null // even more data for expert users
}
