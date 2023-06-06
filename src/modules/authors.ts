export interface Author {
  id: string
  name: string
  description: string
  websiteurl: string
  email: string
  twitterusername: string
  gumroadusername: string
  discordusername: string
  discordserverinviteurl: string
  patreonusername: string
  categories: string[]
  ownedby: string
  discordserverid: string
  isopenforcommission: boolean
  commissioninfo: string
  showcommissionstatusforassets: boolean
  avatarurl: string
  bannerurl: string
  boothusername: string
  salereason: string
  saledescription: string
  saleexpiresat: Date
  lastModifiedAt: Date
  lastModifiedBy: string
  createdAt: Date
  createdBy: string
}

export interface AuthorMeta {
  id: string
  approvalstatus: string
  approvedat: Date
  accessstatus: string
  publishstatus: string
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
  AuthorsMeta: 'authormeta' // TODO: Rename collection
}
