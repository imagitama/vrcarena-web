import { Asset } from './assets'

export interface AnalyticsEntryFields extends Record<string, any> {
  category: string
  action: string
  parenttable: string
  parent: string
  extradata: any
}

export interface AnalyticsEntry {
  id: string
}

export type SourceTotals = { [url: string]: number }

export interface AnalyticsEntryForAsset extends AnalyticsEntry {
  asset: Asset
  count: number
  url_counts: SourceTotals
}

export enum CollectionNames {
  Analytics = 'analytics',
}

export enum ViewNames {
  GetTopAssetAnalytics = 'gettopassetanalytics',
}
