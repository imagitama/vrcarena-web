import { Asset } from './assets'

export interface AnalyticsEntry {
  id: string
  category: string
  action: string
  parenttable: string
  parent: string
  extradata: any
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
