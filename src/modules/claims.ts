export enum ClaimStatus {
  Active = 'active',
  Deleted = 'deleted',
}

export interface Claim extends Record<string, unknown> {
  id: string
  parenttable: string
  parent: string
  comments: string | null
  status: ClaimStatus
  lastmodifiedat: string | null // date
  lastmodifiedby: string | null // id
  createdat: string // date
  createdby: string // id
}

export interface FullClaim<TParentData = any> extends Claim {
  createdbyusername: string
  createdbyavatarurl: string
  parentdata: TParentData
}

export const CollectionNames = {
  Claims: 'claims',
}

export const ViewNames = {
  GetFullClaims: 'getfullclaims',
}
