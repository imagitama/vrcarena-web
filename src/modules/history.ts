export interface HistoryEntryChanges<TData = any> {
  changes: Partial<TData>
}

export interface HistoryEntry<TData = any> {
  id: string
  createdby: string
  createdat: Date
  parenttable: string
  parent: string
  message: string
  data:
    | HistoryEntryChanges<TData>
    | {
        record: TData
      }
}

export interface CreateHistoryEntry<TData = any> extends HistoryEntry<TData> {
  data: {
    record: TData
  }
}

export interface EditHistoryEntry<TData = any> extends HistoryEntry<TData> {
  data: HistoryEntryChanges<TData>
}

export interface FullHistoryEntry<TData = any> extends HistoryEntry<TData> {
  createdbyusername: string
  parentdata: any
  parentchilddata: any // if a meta record, load up the non-meta record
}

export const createMessage = 'Create'
export const editMessage = 'Edit'

export enum Message {
  Create = 'Create',
  Edit = 'Edit',
}

export enum CollectionNames {
  History = 'history',
}

export enum ViewNames {
  GetFullHistory = 'getfullhistory',
  GetAllHistory = 'getallhistory',
}
