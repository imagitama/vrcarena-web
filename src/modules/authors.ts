import { AccessStatus, ApprovalStatus, PublishStatus } from './common'

export interface AuthorForList extends Record<string, any> {
  id: string
  name: string
  avatarurl: string | null
  accessstatus: AccessStatus
  createdat: string // date
}

export interface AuthorFields extends Record<string, unknown> {
  name: string | null
  description: string | null
  websiteurl: string | null
  email: string | null
  twitterusername: string | null
  gumroadusername: string | null
  itchusername: string | null
  jinxxyusername: string | null
  discordusername: string | null
  discordserverinviteurl: string
  patreonusername: string | null
  categories: string[]
  discordserverid: string
  avatarurl: string | null
  boothusername: string | null
  kofiusername: string | null
  payhipusername: string | null
}

export interface Author extends AuthorFields {
  id: string
  lastmodifiedat: string | null // date
  lastmodifiedby: string | null
  createdat: string // date
  createdby: string
}

export interface AuthorMeta extends Record<string, unknown> {
  id: string
  approvalstatus: ApprovalStatus
  approvedat: string // date
  accessstatus: AccessStatus
  publishstatus: PublishStatus
  publishedby: string
  editornotes: string
  lastmodifiedat: string | null // date
  lastmodifiedby: string | null
  createdat: string // date
  createdby: string
}

export interface FullAuthor extends AuthorMeta, Author {
  lastmodifiedbyusername: string
  lastmodifiedbyavatarurl: string
  createdbyusername: string
  createdbyavatarurl: string
}

export enum CollectionNames {
  Authors = 'authors',
  AuthorsMeta = 'authorsmeta',
}

export enum ViewNames {
  GetAuthorsForList = 'getauthorsforlist',
  GetFullAuthors = 'getfullauthors',
  GetPublicAuthors = 'getpublicauthors',
}

export enum FunctionNames {
  GetAuthorsWithUrl = 'getauthorswithurl',
}
