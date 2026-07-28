import { AccessStatus } from './common'

export enum SocialAttachmentType {
  Image = 'image',
}

export interface SocialAttachment {
  type: SocialAttachmentType
  url: string
}

export interface SocialPostFields extends Record<string, unknown> {
  parent: string | null
  text: string
  isadult: boolean
  tags: string[]
  attachments: SocialAttachment[]
}

export interface SocialPost extends SocialPostFields {
  id: string
  createdat: string
  createdby: string
  lastmodifiedat: string | null
  lastmodifiedby: string | null
}

export interface SocialPostMeta {
  editornotes: string
  accessstatus: AccessStatus
  createdat: string
  createdby: string
  lastmodifiedat: string | null
  lastmodifiedby: string | null
}

export interface FullSocialPost extends SocialPost, SocialPostMeta {
  createdbyusername: string
  createdbyavatarurl: string
  reactionsummaries: ReactionSummary[]
  myreactionemoji: string
  mentions: string[]
  replycount: number
}

export type PublicSocialPost = FullSocialPost

export interface SocialReactionUpdateFields {
  emoji: string
}

export interface SocialReactionInsertFields extends SocialReactionUpdateFields {
  parent: string
}

export interface SocialReaction extends SocialReactionInsertFields {
  createdat: string
  createdby: string
  lastmodifiedat: string | null
  lastmodifiedby: string | null
}

export interface ReactionSummary {
  emoji: string
  count: number
  usernames: string[]
}

export enum CollectionNames {
  SocialPosts = 'socialposts',
  SocialPostMeta = 'socialpostmeta',
  SocialReactions = 'socialreactions',
}

export enum ViewNames {
  GetPublicSocialPosts = 'getpublicsocialposts',
}
