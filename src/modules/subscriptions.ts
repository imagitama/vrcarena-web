export interface Subscription extends Record<string, any> {
  id: string
  parenttable: string
  parent: string
  createdby: string
  topics: string[]
}

export enum CollectionNames {
  Subscriptions = 'subscriptions',
}
