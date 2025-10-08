export interface RepReason extends Record<string, any> {
  name: string // unique
  delta: number // int
  description: string | null
  lastmodifiedby: string | null // id
  lastmodifiedat: string | null // date
  createdby: string // id
  createdat: string // date
}

export interface RepChange extends Record<string, any> {
  id: string
  userid: string
  reason: string // RepReason.name
  delta: number // int
  relateddata: any // object
  createdby: string // id
  createdat: string // date
}

export interface FullRepChange extends RepChange {
  reasoninfo: RepReason
  userusername: string
  userreputation: number
}

export enum CollectionNames {
  RepReasons = 'repreasons',
  RepChanges = 'repchanges',
}

export enum ViewNames {
  GetFullRepChanges = 'GetFullRepChanges',
}
