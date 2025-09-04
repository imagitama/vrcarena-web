export interface AssetNotes extends Record<string, any> {
  ids: string // assetid_userid
  asset: string
  notes: string
  lastmodifiedat: string | null // date
  lastmodifiedby: string | null
  createdat: string // date
  createdby: string
}

export enum CollectionNames {
  AssetNotes = 'assetnotes',
}
