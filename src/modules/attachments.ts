import { AccessStatus, ApprovalStatus } from './common'

export interface AttachmentFields extends Record<string, unknown> {
  reason: AttachmentReason
  url: string
  type: AttachmentType | null
  thumbnailurl: string
  title: string | null
  description: string | null
  license: string | null
  isadult: boolean | null // null means inherit
  tags: string[]
  // these arent needed as assets can connect to attachments
  parenttable?: string
  parentid?: string
}

export interface Attachment extends AttachmentFields {
  id: string
  lastmodifiedby: string | null
  lastmodifiedat: string | null
  createdby: string
  createdat: string
}

export interface AttachmentForList extends Attachment {
  approvalstatus: ApprovalStatus
  accessstatus: AccessStatus
  createdbyusername: string
}

export interface FullAttachment extends Attachment {
  approvalstatus: ApprovalStatus
  approvedat: string | null
  accessstatus: AccessStatus
  editornotes: string | null
  createdbyusername: string
  lastmodifiedbyusername: string
}

export enum AttachmentReason {
  AssetFile = 'asset-file',
  UserAdded = 'user-added',
  Tutorial = 'tutorial',
}

export enum AttachmentType {
  Image = 'image',
  Url = 'url',
  File = 'file',
}

export enum CollectionNames {
  Attachments = 'attachments',
  AttachmentsMeta = 'attachmentsmeta',
}

export enum ViewNames {
  GetAttachmentsForList = 'getattachmentsforlist',
  GetFullAttachments = 'getfullattachments',
  GetPublicAttachments = 'getpublicattachments',
}

export const isFullAttachment = (thing: any): thing is FullAttachment =>
  thing && thing.createdbyusername
