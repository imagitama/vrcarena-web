import { AccessStatus, ApprovalStatus, StatusChanges } from './common'

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
  id: string
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
  createdbyavatarurl: string | null
  createdbyreputation: number
  lastmodifiedbyusername: string | null
  lastmodifiedbyavatarurl: string | null
  statuschanges: StatusChanges | null
}

// AssetOverview
export interface AmendmentWithMeta extends Amendment, AmendmentMeta {}

export enum CollectionNames {
  Amendments = 'amendments',
  AmendmentsMeta = 'amendmentsmeta',
}

export enum ViewNames {
  GetFullAmendments = 'getfullamendments',
  GetAmendmentsForList = 'getamendmentsforlist',
}

export enum FunctionNames {
  DeleteMyAmendment = 'deletemyamendment',
}
