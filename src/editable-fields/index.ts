import React from 'react'
import { CollectionNames as OldCollectionNames } from '../hooks/useDatabaseQuery'
import { CollectionNames } from '../data-store'
import authors from './authors'
import users from './users'
import discordServers from './discord-servers'
import userMeta from './user-meta'
import playlists from './playlists'
import pages from './pages'
import { fieldTypes } from '../generic-forms'

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

export interface CustomProperties {
  renderer: (props: {
    onChange: (newValue: any) => void
    value: any
    databaseResult?: any // the raw data for the original item
  }) => React.ReactElement
}

export interface EditableField<TData> {
  name: keyof TData
  label?: string // optional for hidden fields
  type: keyof typeof fieldTypes
  default?: any
  hint?: string
  imageUploadProperties?: ImageUploadProperties
  searchableProperties?: SearchableProperties
  customProperties?: CustomProperties
  isRequired?: boolean
  options?: Option[]
  isEditable?: boolean
  length?: number
  multiline?: true
}

// @ts-ignore
const editableFieldsByCollectionName: {
  [collectionName: string]: EditableField<any>[]
} = {
  [OldCollectionNames.Authors]: authors,
  [OldCollectionNames.Users]: users,
  [OldCollectionNames.DiscordServers]: discordServers,
  [OldCollectionNames.UserMeta]: userMeta,
  [CollectionNames.Playlists]: playlists,
  [CollectionNames.Pages]: pages,
}

export default editableFieldsByCollectionName
