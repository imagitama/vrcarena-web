import * as icons from '@/icons'

export type IconName = keyof typeof icons

export interface RepReason extends Record<string, any> {
  name: string // unique
  delta: number // int
  description: string | null
  icon: IconName | null
  milestonelabel: string | null
  lastmodifiedat: string | null // date
  lastmodifiedby: string | null // id
  createdat: string // date
  createdby: string | null // id, can be null
}

export interface RepChangeFields<TRelatedData = any>
  extends Record<string, any> {
  id: string
  userid: string
  reason: string // RepReason.name
  delta: number // int
  relateddata: TRelatedData | null // object
  createdat: string // date
  createdby: string | null // id, can be null
}

export interface RepChange<TRelatedData = any>
  extends RepChangeFields<TRelatedData> {
  id: string
  createdat: string // date
  createdby: string | null // id, can be null
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
