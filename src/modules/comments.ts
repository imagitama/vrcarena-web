import { AccessStatus } from './common'
import { UserRoles } from './users'

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

export interface CommentMeta {
  accessstatus: AccessStatus
  editornotes: string
  lastmodifiedat: string
  lastmodifiedby: string
  createdat: string
  createdby: string
}

export interface FullComment extends Comment, CommentMeta {
  createdbyusername: string
  createdbyavatarurl: string
  createdbyrole: UserRoles
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
