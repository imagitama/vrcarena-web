import React from 'react'
import authors from './authors'
import users from './users'
import discordServers from './discord-servers'
import userMeta from './user-meta'
import pages from './pages'
import { fieldTypes } from '../generic-forms'
import attachments from './attachments'

import { CollectionNames as AttachmentsCollectionNames } from '../modules/attachments'
import { CollectionNames as UsersCollectionNames } from '../modules/users'
import { CollectionNames as DiscordServersCollectionNames } from '../modules/discordservers'
import { CollectionNames as AuthorsCollectionNames } from '../modules/authors'
import { CollectionNames as PagesCollectionNames } from '../modules/pages'

export interface Option {
  value: string | null
  label: string
}

export interface ImageUploadProperties {
  width: number
  height: number
  bucketName: string
  directoryName?: string
}

export interface SearchableProperties {
  collectionName: string
  fieldAsLabel: string
  renderer: (props: { item: any }) => React.ReactElement
}

export interface CustomProperties<TRecord, TFieldData> {
  renderer: (props: {
    onChange: (newValue: TFieldData) => void
    value: TFieldData
    databaseResult: TRecord // the raw data for the original item
  }) => React.ReactElement
}

export interface ItemProperties {
  collectionName: string
  fieldAsLabel?: string
  getLabel?: (item: any) => string
}

export interface EditableField<TRecord, TFieldData = undefined> {
  name: keyof TRecord
  label?: string // optional for hidden fields
  type: keyof typeof fieldTypes
  default?: any
  hint?: string
  imageUploadProperties?: ImageUploadProperties
  searchableProperties?: SearchableProperties
  customProperties?: CustomProperties<TRecord, TFieldData>
  itemProperties?: ItemProperties
  isRequired?: boolean
  options?: Option[]
  isEditable?: boolean
  length?: number
  multiline?: true
  section?: string
  allowEmpty?: boolean // if boolean column can be "empty" or undefined
}

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
}

export default editableFieldsByCollectionName
