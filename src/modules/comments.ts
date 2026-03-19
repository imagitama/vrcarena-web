import { AccessStatus } from './common'
import { BanStatus, UserRoles } from './users'

export interface Comment extends Record<string, unknown> {
  id: string
  comment: string
  isprivate: boolean
  parenttable: string
  parent: string
  lastmodifiedat: string
  lastmodifiedby: string
  createdat: string
  createdby: string
}

export enum SuspicionReason {
  LongLength = 'long_length',
  WeirdChars = 'weird_chars',
  SameAsLast = 'same_as_last',
}

export interface CommentMeta {
  accessstatus: AccessStatus
  editornotes: string
  suspicionamount: number | null
  suspicionreason: SuspicionReason | null
  lastmodifiedat: string
  lastmodifiedby: string
  createdat: string
  createdby: string
}

export interface FullComment extends Comment, CommentMeta {
  createdbyusername: string
  createdbyavatarurl: string
  createdbyrole: UserRoles
  createdbybanstatus: BanStatus
  mentions: string[]
}

export enum CollectionNames {
  Comments = 'comments',
  CommentsMeta = 'commentsmeta',
}

export enum ViewNames {
  GetPublicComments = 'getpubliccomments',
  GetFullComments = 'getfullcomments',
}
