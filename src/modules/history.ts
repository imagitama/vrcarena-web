export interface HistoryEntry {
  id: string
  createdby: string
  createdat: Date
  parenttable: string
  parent: string
  message: string
  data: any
}

export interface FullHistoryEntry extends HistoryEntry {
  createdbyusername: string
  parentdata: any
  parentchilddata: any // if a meta record, load up the non-meta record
}

export const createMessage = 'Create'
export const editMessage = 'Edit'
