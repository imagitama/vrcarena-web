import { Amendment } from './amendments'
import { ArchivedReason, Asset, DeclinedReason, DeletionReason } from './assets'
import { AccessStatus, ApprovalStatus } from './common'

export interface SubEditorResponseField {
  verdict: boolean
  comments?: string
}

export interface SubEditorResponseFields extends Record<string, any> {
  parenttable: string
  parentid: string
  fields: { [fieldName: string]: SubEditorResponseField } | null
  // accessstatus: AccessStatus | null
  approvalstatus: ApprovalStatus | null
  // deletionreason: DeletionReason | null
  // archivedreason: ArchivedReason | null
  declinedreasons: DeclinedReason[] | null
  comments: string | null
}

export interface SubEditorResponse extends SubEditorResponseFields {
  id: string
  lastmodifiedat: string | null
  lastmodifiedby: string | null
  createdat: string
  createdby: string
}

export interface FullSubEditorResponse extends SubEditorResponse {
  createdbyusername: string
  createdbyavatarurl: string
  createdbyreputation: number
  lastmodifiedbyusername: string | null
  lastmodifiedbyavatarurl: string | null
  lastmodifiedbyreputation: number | null
  parentdata: Asset | Amendment
}

export enum CollectionNames {
  SubEditorResponses = 'subeditorresponses',
}

export enum ViewNames {
  GetFullSubEditorResponses = 'getfullsubeditorresponses',
}
