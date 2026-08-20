import { AccessStatus, ApprovalStatus } from './common'

export interface Amendment extends AmendmentFields {
  id: string
  lastmodifiedby: string | null
  lastmodifiedat: Date | null
  createdby: string
  createdat: Date
}

export interface AmendmentFields extends Record<string, unknown> {
  parenttable: string
  parent: string
  fields: { [fieldName: string]: any }
  comments: string | null
}

export interface AmendmentMeta {
  accessstatus: AccessStatus
  approvalstatus: ApprovalStatus
  approvedat: string | null // date
  approvedby: string | null // id
  editornotes: string | null
  lastmodifiedby: string | null
  lastmodifiedat: Date | null
  createdby: string
  createdat: Date
}

export interface FullAmendment<T> extends Amendment, AmendmentMeta {
  parentdata: T
  createdbyusername: string
  createdbyreputation: number
  lastmodifiedbyusername: string | null
}

export enum CollectionNames {
  Amendments = 'amendments',
  AmendmentsMeta = 'amendmentsmeta',
}

export enum ViewNames {
  GetFullAmendments = 'getfullamendments',
  GetAmendmentsWaitingForApproval = 'getamendmentswaitingforapproval',
}

export enum FunctionNames {
  DeleteMyAmendment = 'deletemyamendment',
}
