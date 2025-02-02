export enum ClaimStatus {
  Active = 'active',
  Deleted = 'deleted',
}

export interface Claim extends Record<string, unknown> {
  id: string
  parenttable: string
  parent: string
  comments: string
  status: ClaimStatus
  lastmodifiedat: Date | null
  lastmodifiedby: string | null
  createdat: Date
  createdby: string
}

export interface FullClaim extends Claim {
  createdbyusername: string
  createdbyavatarurl: string
  parentdata: any
}

export const CollectionNames = {
  Claims: 'claims',
}

export const ViewNames = {
  GetFullClaims: 'getfullclaims',
}
