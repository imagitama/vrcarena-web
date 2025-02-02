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
  createdat: Date
  createdby: string
  lastmodifiedat: Date
  lastmodifiedby: string
}

export interface SocialPostMeta {
  editornotes: string
  accessstatus: AccessStatus
  createdat: Date
  createdby: string
  lastmodifiedat: Date
  lastmodifiedby: string
}

export interface FullSocialPost extends SocialPost, SocialPostMeta {
  createdbyusername: string
  createdbyavatarurl: string
  reactionsummaries: ReactionSummary[]
  myreactionemoji: string
  mentions: string[]
  replycount: number
}

export interface SocialReactionUpdateFields {
  emoji: string
}

export interface SocialReactionInsertFields extends SocialReactionUpdateFields {
  parent: string
}

export interface SocialReaction extends SocialReactionInsertFields {
  createdat: Date
  createdby: string
  lastmodifiedat: Date
  lastmodifiedby: string
}

export interface ReactionSummary {
  emoji: string
  count: number
  usernames: string[]
}

export const CollectionNames = {
  SocialPosts: 'socialposts',
  SocialPostMeta: 'socialpostmeta',
  SocialReactions: 'socialreactions',
}
