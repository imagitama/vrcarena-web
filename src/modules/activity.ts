export interface ActivityEntry {
  id: string
  message: string
  parent: string
  parenttable: string
  data: { [collectionName: string]: string }
  createdat: Date
  createdby: string
}

export interface FullActivityEntry extends ActivityEntry {
  parentdata: any
  moredata: { [collectionName: string]: any }
  createdbyusername: string
}
