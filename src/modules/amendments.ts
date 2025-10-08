import { ApprovalStatus } from './common'

export interface Amendment extends AmendmentFields {
  id: string
  lastmodifiedby: string
  lastmodifiedat: Date
  createdby: string
  createdat: Date
}

export interface AmendmentFields extends Record<string, unknown> {
  parenttable: string
  parent: string
  fields: { [fieldName: string]: any }
  comments: string
}

export interface AmendmentMeta {
  approvalstatus: ApprovalStatus
  approvedat: string // date
  approvedby: string // id
  editornotes: string
}

export interface FullAmendment extends Amendment, AmendmentMeta {
  approvalstatus: ApprovalStatus
  parentdata: any
  createdbyusername: string
  createdbyreputation: number
}

export enum CollectionNames {
  Amendments = 'amendments',
  AmendmentsMeta = 'amendmentsmeta',
}

export enum ViewNames {
  GetFullAmendments = 'getfullamendments',
  GetAmendmentsWaitingForApproval = 'getamendmentswaitingforapproval',
}
