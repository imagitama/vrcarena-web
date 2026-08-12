import { AccessStatus, ResolutionStatus } from './common'
import { Tag } from './tags'

export enum TagSuggestionType {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Replace = 'replace',
}

export interface TagSuggestion extends Record<string, any> {
  id: string
  targettag: string | null // null for create
  type: TagSuggestionType
  relatedtag: string | null
  fields: Partial<Tag> | null
  comments: string | null
  lastmodifiedat: string | null // Date
  lastmodifiedby: string | null
  createdat: string // Date
  createdby: string
}

export { ResolutionStatus }

export interface TagSuggestionMeta extends Record<string, unknown> {
  accessstatus: AccessStatus
  editornotes: string | null
  resolutionstatus: ResolutionStatus
  resolvedat: string | null // Date
  resolvedby: string | null
  resolutionnotes: string | null
}

export interface FullTagSuggestion extends TagSuggestion, TagSuggestionMeta {
  createdbyusername: string
  createdbyavatarurl: string
  lastmodifiedbyusername: string
  lastmodifiedbyavatarurl: string
  resolvedbyusername: string
  resolvedbyavatarurl: string
}

export enum CollectionNames {
  TagSuggestions = 'tagsuggestions',
  TagSuggestionsMeta = 'tagsuggestionsmeta',
}

export enum ViewNames {
  GetFullTagSuggestions = 'getfulltagsuggestions',
}
