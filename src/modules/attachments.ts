import { AccessStatus, ApprovalStatus } from './common'

export interface AttachmentFields extends Record<string, unknown> {
  reason: AttachmentReason
  url: string
  type: AttachmentType | null
  thumbnailurl: string
  title: string
  description: string
  license: string | null
  isadult: boolean | null // null means inherit
  tags: string[]
  // these arent needed as assets can connect to attachments
  parenttable?: string
  parentid?: string
}

export interface Attachment extends AttachmentFields {
  id: string
  createdby: string
  createdat: string
  lastmodifiedby: string
  lastmodifiedat: string
}

export interface FullAttachment extends Attachment {
  approvalstatus: ApprovalStatus
  approvedat: string
  accessstatus: AccessStatus
  editornotes: string
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
  GetFullAttachments = 'getfullattachments',
  GetPublicAttachments = 'getpublicattachments',
}

export const isFullAttachment = (thing: any): thing is FullAttachment =>
  thing && thing.createdbyusername
