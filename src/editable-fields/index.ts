import React from 'react'

import { fieldTypes } from '@/generic-forms'
import { CollectionNames as AttachmentsCollectionNames } from '@/modules/attachments'
import { CollectionNames as UsersCollectionNames } from '@/modules/users'
import { CollectionNames as DiscordServersCollectionNames } from '@/modules/discordservers'
import { CollectionNames as AuthorsCollectionNames } from '@/modules/authors'
import { CollectionNames as PagesCollectionNames } from '@/modules/pages'
import { CollectionNames as AssetsCollectionNames } from '@/modules/assets'

import { ImageUploaderConfig } from '@/components/image-uploader'
import { TagInputSettings } from '@/components/tag-input'

import attachments from './attachments'
import assets from './assets'
import authors from './authors'
import users from './users'
import discordServers from './discord-servers'
import userMeta from './user-meta'
import pages from './pages'
import { GenericInputProps } from '@/components/generic-editor/types'

export interface Option {
  value: string | null
  label: string
  subLabel?: string
}

export interface EditableFieldBase<TRecord> {
  type: fieldTypes
  name: keyof TRecord
  label?: string // optional for hidden fields
  default?: any
  hint?: string
  isRequired?: boolean
  isEditable?: boolean
  length?: number
  multiline?: true
  section?: string
  allowEmpty?: boolean // if boolean column can be "empty" or undefined
  overrideValue?: any
}

export interface TextEditableField<TRecord>
  extends ImageUploaderConfig,
    EditableFieldBase<TRecord> {
  type: fieldTypes.text
  minLength?: number
  maxLength?: number
}

export interface SelectEditableField<TRecord>
  extends ImageUploaderConfig,
    EditableFieldBase<TRecord> {
  type: fieldTypes.singlechoice | fieldTypes.multichoice | fieldTypes.dropdown
  options: Option[]
}

export interface ImageUploadEditableField<TRecord>
  extends ImageUploaderConfig,
    EditableFieldBase<TRecord> {
  type: fieldTypes.imageUpload
  getDirectoryPath?: (record: TRecord) => string
}

export interface SearchableEditableField<TRecord>
  extends EditableFieldBase<TRecord> {
  type: fieldTypes.searchable
  collectionName: string
  fieldAsLabel: string
  renderer: (props: { item: any }) => React.ReactElement
}

export interface CustomEditableField<
  TValue,
  TRecord extends Record<string, any>
> extends EditableFieldBase<TRecord> {
  type: fieldTypes.custom
  renderer: (
    props: GenericInputProps<TValue, TRecord, EditableField<TRecord>>
  ) => React.ReactElement
}

export interface ItemEditableField<TRecord> extends EditableFieldBase<TRecord> {
  type: fieldTypes.item
  collectionName: string
  fieldAsLabel?: string
  getLabel?: (item: any) => string
}

export interface DateRangeEditableField<TRecord>
  extends EditableFieldBase<TRecord> {
  type: fieldTypes.dateRange
  startsAtFieldName: Extract<keyof TRecord, string>
  endsAtFieldName: Extract<keyof TRecord, string>
}

export interface CheckboxEditableField<TRecord>
  extends EditableFieldBase<TRecord> {
  type: fieldTypes.checkbox
  checkboxLabel?: string
}

export interface UrlEditableField<TRecord> extends EditableFieldBase<TRecord> {
  type: fieldTypes.url
}

export interface TagEditableField<TRecord>
  extends TagInputSettings,
    EditableFieldBase<TRecord> {
  type: fieldTypes.tags
}

export interface MarkdownEditableField<TRecord>
  extends TagInputSettings,
    EditableFieldBase<TRecord> {
  type: fieldTypes.textMarkdown
  allowImages?: boolean
}

export interface JsonEditableField<TRecord> extends EditableFieldBase<TRecord> {
  type: fieldTypes.json
  json: EditableField<any>[]
}

export type EditableField<TRecord extends Record<string, any>> =
  | TextEditableField<TRecord>
  | DateRangeEditableField<TRecord>
  | CheckboxEditableField<TRecord>
  | ImageUploadEditableField<TRecord>
  | SearchableEditableField<TRecord>
  | CustomEditableField<any, TRecord>
  | ItemEditableField<TRecord>
  | UrlEditableField<TRecord>
  | TagEditableField<TRecord>
  | SelectEditableField<TRecord>
  | MarkdownEditableField<TRecord>
  | JsonEditableField<TRecord>
  | EditableFieldBase<TRecord>

// @ts-ignore
const editableFieldsByCollectionName: {
  [collectionName: string]: EditableField<any>[]
} = {
  [AuthorsCollectionNames.Authors]: authors,
  [UsersCollectionNames.Users]: users,
  [DiscordServersCollectionNames.DiscordServers]: discordServers,
  [UsersCollectionNames.UsersMeta]: userMeta,
  [PagesCollectionNames.Pages]: pages,
  [AttachmentsCollectionNames.Attachments]: attachments,
  [AssetsCollectionNames.Assets]: assets,
}

export default editableFieldsByCollectionName

export const getLabelForFieldName = (
  fieldName: string,
  type: string
): string | null => {
  const editableField = getEditableField(fieldName, type)

  if (!editableField || !editableField.label) return null

  return editableField.label
}

export const getEditableField = (
  fieldName: string,
  type: string
): EditableField<any> | null => {
  if (!(type in editableFieldsByCollectionName)) return null

  const editableFields = editableFieldsByCollectionName[type]

  const editableField = editableFields.find((field) => field.name === fieldName)

  if (!editableField) return null

  return editableField
}
