export interface AnalyticsEntry {
  category: string
  action: string
  parentTable: string
  parent: string
  extraData: any
}

export enum CollectionNames {
  Analytics = 'analytics',
}
