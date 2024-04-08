export interface HistoryEntry<TData = any> {
  id: string
  createdby: string
  createdat: Date
  parenttable: string
  parent: string
  message: string
  data: {
    changes: TData
  }
}

export interface FullHistoryEntry<TData = any> extends HistoryEntry<TData> {
  createdbyusername: string
  parentdata: any
  parentchilddata: any // if a meta record, load up the non-meta record
}

export const createMessage = 'Create'
export const editMessage = 'Edit'

export enum CollectionNames {
  History = 'history',
}
