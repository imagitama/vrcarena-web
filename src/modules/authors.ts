import { AccessStatus, ApprovalStatus, PublishStatus } from './common'

export interface AuthorFields extends Record<string, unknown> {
  name: string
  description: string
  websiteurl: string
  email: string
  twitterusername: string
  gumroadusername: string
  itchusername: string
  jinxxyusername: string
  discordusername: string
  discordserverinviteurl: string
  patreonusername: string
  categories: string[]
  discordserverid: string
  isopenforcommission: boolean
  commissioninfo: string
  showcommissionstatusforassets: boolean
  avatarurl: string
  bannerurl: string
  boothusername: string
  salereason: string
  saledescription: string
  saleexpiresat: string | undefined
  promourl: string
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
