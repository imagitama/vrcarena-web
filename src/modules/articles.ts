import { Attachment } from './attachments'
import { AccessStatus, ApprovalStatus } from './common'

export interface Article extends Record<string, any> {
  id: string
  title: string
  content: string
  parenttable: string | null
  parentid: string | null
  attachmentids: string[]
  tags: string[]
  lastmodifiedby: string | null
  lastmodifiedat: string | null
  createdby: string
  createdat: string
}

export interface ArticleMeta extends Record<string, any> {
  editornotes: string | null
  approvalstatus: ApprovalStatus
  accessstatus: AccessStatus
  lastmodifiedby: string | null
  lastmodifiedat: string | null
  createdby: string
  createdat: string
}

export interface FullArticle extends Article, ArticleMeta {
  attachmentsdata: Attachment[]
  lastmodifiedbyusername: string | null
  lastmodifiedbyavatarurl: string | null
  createdbyusername: string
  createdbyavatarurl: string
}

export enum CollectionNames {
  Articles = 'articles',
  ArticlesMeta = 'articlesmeta',
}

export enum ViewNames {
  GetFullArticles = 'getfullarticles',
}
