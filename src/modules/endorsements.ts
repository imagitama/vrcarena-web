export interface Endorsement extends Record<string, any> {
  id: string
  asset: string
  createdby: string
}

export enum CollectionNames {
  Endorsements = 'endorsements',
}
