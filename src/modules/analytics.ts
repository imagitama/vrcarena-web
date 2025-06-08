export interface AnalyticsEntry {
  category: string
  action: string
  parenttable: string
  parent: string
  extradata: any
}

export enum CollectionNames {
  Analytics = 'analytics',
}
