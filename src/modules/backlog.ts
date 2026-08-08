import { AccessStatus } from './common'

export enum BacklogItemType {
  Asset = 'asset',
  Author = 'author',
}

export interface SupportTicketCategoryMeta {
  label: string
  description: string
  questions?: string[]
}

export interface SupportTicketAnswer {
  question: string
  answer: string
}

export interface BacklogItem extends Record<string, any> {
  id: string
  type: BacklogItemType
  url: string
  lastmodifiedat: string | null // date
  lastmodifiedby: string | null
  createdat: string // date
  createdby: string
}

export interface BacklogItemMeta extends Record<string, unknown> {
  editornotes: string | null
  accessstatus: AccessStatus
}

export interface FullBacklogItem extends BacklogItem, BacklogItemMeta {
  createdbyusername: string
  createdbyavatarurl: string
  lastmodifiedbyusername: string
  lastmodifiedbyavatarurl: string
}

export enum CollectionNames {
  BacklogItems = 'backlogitems',
  BacklogItemsMeta = 'backlogitemsmeta',
}

export enum ViewNames {
  GetFullBacklogItems = 'getfullbacklogitems',
}
