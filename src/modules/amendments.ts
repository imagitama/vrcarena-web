export const AmendmentsFieldNames = {
  parentTable: 'parenttable',
  parent: 'parent',
  fields: 'fields',
  comments: 'comments',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat',
  createdBy: 'createdby',
  createdAt: 'createdat'
}

export const GetFullAmendmentsFieldNames = {
  parentData: 'parentdata',
  createdByUsername: 'createdbyusername'
}

export const AmendmentsMetaFieldNames = {
  id: 'id',
  approvalstatus: 'approvalstatus',
  approvedat: 'approvedat',
  approvedby: 'approvedby',
  editornotes: 'editornotes',
  lastmodifiedat: 'lastmodifiedat',
  lastmodifiedby: 'lastmodifiedby',
  createdat: 'createdat',
  createdby: 'createdby'
}

// types

export interface Amendment extends AmendmentFields {
  id: string
  lastmodifiedby: string
  lastmodifiedat: Date
  createdby: string
  createdat: Date
}

export interface AmendmentFields {
  parenttable: string
  parent: string
  fields: { [fieldName: string]: any }
  comments: string
}

export interface FullAmendment extends Amendment {
  approvalstatus: string
  parentdata: any
  createdbyusername: any
}

export const CollectionNames = {
  Amendments: 'amendments',
  AmendmentsMeta: 'amendmentsmeta'
}
