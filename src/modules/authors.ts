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
  // ownedby: string
  discordserverid: string
  isopenforcommission: boolean
  commissioninfo: string
  showcommissionstatusforassets: boolean
  avatarurl: string
  bannerurl: string
  boothusername: string
  salereason: string
  saledescription: string
  saleexpiresat: Date | undefined
  promourl: string
}

export interface Author extends AuthorFields {
  id: string
  lastmodifiedat: Date
  lastmodifiedby: string
  createdat: Date
  createdby: string
}

export interface AuthorMeta extends Record<string, unknown> {
  id: string
  approvalstatus: ApprovalStatus
  approvedat: Date
  accessstatus: AccessStatus
  publishstatus: PublishStatus
  publishedby: string
  editornotes: string
  lastmodifiedat: Date
  lastmodifiedby: string
  createdat: Date
  createdby: string
}

export interface FullAuthor extends AuthorMeta, Author {
  lastmodifiedbyusername: string
  lastmodifiedbyavatarurl: string
  createdbyusername: string
  createdbyavatarurl: string
}

export const CollectionNames = {
  Authors: 'authors',
  AuthorsMeta: 'authormeta', // TODO: Rename collection
}
