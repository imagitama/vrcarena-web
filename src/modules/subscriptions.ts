export interface Subscription {
  id: string
  parenttable: string
  parent: string
  createdby: string
  topics: string[]
}

export enum CollectionNames {
  Subscriptions = 'subscriptions',
}
