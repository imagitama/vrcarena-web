export interface AlgoliaAssetRecord {
  title: string
  // display only
  slug: string
  thumbnailUrl: string
  isAdult: boolean
  category: string // AssetCategory
  species: string[]
  // joined data
  authorName: string
  speciesNames: string[]
  // searchable only
  description: string
  // translations (copied from config.ts)
  'title_en-US': string | null
  title_es: string | null
  'title_zh-CN': string | null
  title_ja: string | null
  'description_en-US': string | null
  description_es: string | null
  'description_zh-CN': string | null
  description_ja: string | null
}
