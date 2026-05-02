export interface SpecialEntry<TValue> extends Record<string, any> {
  id: string // anything
  value: TValue | null // anything
  lastmodifiedat: string | null // date
  lastmodifiedby: string | null
}

export enum CollectionNames {
  Special = 'special',
}
