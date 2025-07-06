import { OrderDirections } from './hooks/useDatabaseQuery'

export enum FilterType {
  Equal,
  Multichoice,
  NotEqual,
  // SingleChoice
}

export enum FilterSubType {
  UserId,
  Null,
  Id, // eg. asset
}

export interface BaseFilter<TRecord> {
  fieldName: Extract<keyof TRecord, string>
  type: FilterType
  subType?: FilterSubType
  label?: string // defaults to fieldName
  direction?: OrderDirections
  defaultActive?: boolean
  defaultValue?: any
}

export interface EqualFilter<TRecord> extends BaseFilter<TRecord> {
  type: FilterType.Equal
  suggestions?: string[]
}

export interface NotEqualFilter<TRecord> extends BaseFilter<TRecord> {
  type: FilterType.NotEqual
  suggestions?: string[]
}

export interface MultichoiceFilter<TRecord, TEnum> extends BaseFilter<TRecord> {
  type: FilterType.Multichoice
  options: TEnum[] // TODO: allow specifing label in option
}

export type Filter<TRecord, TEnum = undefined> =
  | MultichoiceFilter<TRecord, TEnum>
  | EqualFilter<TRecord>
  | NotEqualFilter<TRecord>
  | BaseFilter<TRecord>

export interface BaseActiveFilter<TRecord> extends BaseFilter<TRecord> {
  value: unknown
}

export interface EqualActiveFilter<TRecord> extends EqualFilter<TRecord> {
  value: string | boolean | number
}

export interface NotEqualActiveFilter<TRecord> extends EqualFilter<TRecord> {
  value: string | boolean | number
}

export interface MultichoiceActiveFilter<TRecord, TEnum>
  extends MultichoiceFilter<TRecord, TEnum> {
  value: TEnum[]
}

export type ActiveFilter<TRecord, TEnum = undefined> =
  | MultichoiceActiveFilter<TRecord, TEnum>
  | EqualActiveFilter<TRecord>
  | NotEqualActiveFilter<TRecord>
  | BaseActiveFilter<TRecord>
