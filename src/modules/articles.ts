import { getIsVrchatNewsArticleUrl } from '@/utils'
import { Attachment } from './attachments'
import { AccessStatus, ApprovalStatus, StatusChanges } from './common'

export const getIsVrchatNewsArticle = (article: Article): boolean =>
  article.sourceurl !== null && getIsVrchatNewsArticleUrl(article.sourceurl)

export interface VrchatNewsArticleMetadata {
  pubDate: string // RFC 2822
}

export const ARTICLE_TAG_SITE = 'site'
export const tags = [
  ARTICLE_TAG_SITE,
  'vrchat',
  'resonite',
  'hardware',
  'steamvr',
  'asset',
]

export interface ArticleFields<TExtraData = null> extends Record<string, any> {
  title: string
  content: string
  parenttable: string | null
  parentid: string | null
  attachmentids: string[]
  tags: string[]
  sourceurl: string | null
  extradata: TExtraData
  slug: string | null
}

export interface Article extends ArticleFields {
  id: string
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
  changes: StatusChanges
}

export enum CollectionNames {
  Articles = 'articles',
  ArticlesMeta = 'articlesmeta',
}

export enum ViewNames {
  GetFullArticles = 'getfullarticles',
}
