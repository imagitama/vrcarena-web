import { CollectionNames as OldCollectionNames } from '../hooks/useDatabaseQuery'
import { CollectionNames } from '../data-store'
import authors from './authors'
import users from './users'
import discordServers from './discord-servers'
import species from './species'
import userMeta from './user-meta'
import events from './events'
import playlists from './playlists'
import pages from './pages'
import { fieldTypes } from '../generic-forms'

export interface Option {
  value: string | null
  label: string
}

export interface EditableField {
  name: string
  label: string
  type: keyof typeof fieldTypes
  default?: any
  hint?: string
  fieldProperties?: any
  isRequired?: boolean
  options?: Option[]
}

// @ts-ignore
const editableFieldsByCollectionName: {
  [collectionName: string]: EditableField[]
} = {
  [OldCollectionNames.Authors]: authors,
  [OldCollectionNames.Users]: users,
  [OldCollectionNames.DiscordServers]: discordServers,
  [OldCollectionNames.Species]: species,
  [OldCollectionNames.UserMeta]: userMeta,
  [CollectionNames.Events]: events,
  [CollectionNames.Playlists]: playlists,
  [CollectionNames.Pages]: pages
}

export default editableFieldsByCollectionName
