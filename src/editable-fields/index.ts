import React from 'react'
import authors from './authors'
import users from './users'
import discordServers from './discord-servers'
import userMeta from './user-meta'
import pages from './pages'
import { fieldTypes } from '../generic-forms'
import attachments from './attachments'
import assets from './assets'

import { CollectionNames as AttachmentsCollectionNames } from '../modules/attachments'
import { CollectionNames as UsersCollectionNames } from '../modules/users'
import { CollectionNames as DiscordServersCollectionNames } from '../modules/discordservers'
import { CollectionNames as AuthorsCollectionNames } from '../modules/authors'
import { CollectionNames as PagesCollectionNames } from '../modules/pages'
import { CollectionNames as AssetsCollectionNames } from '../modules/assets'
import { ImageUploaderConfig } from '@/components/image-uploader'
import { TagInputSettings } from '@/components/tag-input'

export interface Option {
  value: string | null
  label: string
}

export interface EditableFieldBase<TRecord, TFieldData = undefined> {
  type: fieldTypes
  name: keyof TRecord
  label?: string // optional for hidden fields
  alwaysShowLabel?: boolean // override for hidden checkbox label
  default?: any
  hint?: string
  // imageUploadProperties?: ImageUploadProperties<TRecord>
  // searchableProperties?: SearchableProperties
  // customProperties?: CustomProperties<TRecord, TFieldData>
  // itemProperties?: ItemProperties
  isRequired?: boolean
  options?: Option[]
  isEditable?: boolean
  length?: number
  multiline?: true
  section?: string
  allowEmpty?: boolean // if boolean column can be "empty" or undefined
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

export interface CustomEditableField<TRecord, TFieldData>
  extends EditableFieldBase<TRecord> {
  type: fieldTypes.custom
  renderer: (props: {
    onChange: (newValue: TFieldData) => void
    value: TFieldData
    databaseResult: TRecord // the raw data for the original item
    formFields: any
  }) => React.ReactElement
}

export interface ItemEditableField<TRecord, TFieldData>
  extends EditableFieldBase<TRecord, TFieldData> {
  type: fieldTypes.item
  collectionName: string
  fieldAsLabel?: string
  getLabel?: (item: any) => string
}

export interface CheckboxEditableField<TRecord, TFieldData>
  extends EditableFieldBase<TRecord, TFieldData> {
  type: fieldTypes.checkbox
}

export interface UrlEditableField<TRecord, TFieldData>
  extends EditableFieldBase<TRecord, TFieldData> {
  type: fieldTypes.url
}

export interface TagEditableField<TRecord, TFieldData>
  extends TagInputSettings,
    EditableFieldBase<TRecord, TFieldData> {
  type: fieldTypes.tags
}

export type EditableField<TRecord, TFieldData = undefined> =
  | CheckboxEditableField<TRecord, TFieldData>
  | ImageUploadEditableField<TRecord>
  | SearchableEditableField<TRecord>
  | CustomEditableField<TRecord, TFieldData>
  | ItemEditableField<TRecord, TFieldData>
  | UrlEditableField<TRecord, TFieldData>
  | TagEditableField<TRecord, TFieldData>
  | EditableFieldBase<TRecord, TFieldData>

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
