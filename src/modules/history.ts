export interface HistoryEntry<TData = any> {
  id: string
  createdby: string
  createdat: Date
  parenttable: string
  parent: string
  message: string
  data:
    | {
        changes: Partial<TData>
      }
    | {
        record: TData
      }
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
