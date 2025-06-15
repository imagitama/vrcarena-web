import { Author, AuthorMeta } from '../../../../modules/authors'

export type AssetInfo = { id: string; title: string }

export interface AuthorWithAssets {
  id: string
  fields: Author
  assets: AssetInfo[]
  meta: AuthorMeta
}

export interface GetAuthorDupesResult {
  oldest: AuthorWithAssets
  dupes: AuthorWithAssets[]
}

export type SelectedFields = {
  [authorId: string]: string[]
}

export type PlannedField = {
  fieldName: string
  value: any
  sourceId: string
}
