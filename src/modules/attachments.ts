import { AccessStatuses, ApprovalStatuses } from '../hooks/useDatabaseQuery'

export interface AttachmentFields extends Record<string, unknown> {
  reason: AttachmentReason
  url: string
  type: AttachmentType | null
  thumbnailurl: string
  title: string
  description: string
  license: string | null
  isadult: boolean | null
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
  approvalstatus: ApprovalStatuses
  approvedat: string
  accessstatus: AccessStatuses
  editornotes: string
  createdbyusername: string
  lastmodifiedbyusername: string
}

export enum AttachmentReason {
  AssetFile = 'asset-file',
  UserAdded = 'user-added',
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
}

export const isFullAttachment = (thing: any): thing is FullAttachment =>
  thing && thing.createdbyusername
