import { AccessStatus, ApprovalStatus, PublishStatus } from './common'

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
  isopenforcommission: boolean | null
  commissioninfo: string | null
  showcommissionstatusforassets: boolean
  avatarurl: string | null
  bannerurl: string | null
  boothusername: string | null
  kofiusername: string | null
  payhipusername: string | null
  salereason: string | null
  saledescription: string | null
  saleexpiresat: string | undefined
}

export interface Author extends AuthorFields {
  id: string
  lastmodifiedat: string // date
  lastmodifiedby: string
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
  lastmodifiedat: string // date
  lastmodifiedby: string
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
  GetFullAuthors = 'getfullauthors',
  GetPublicAuthors = 'getpublicauthors',
}
