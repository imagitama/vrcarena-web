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

export default {
  [OldCollectionNames.Authors]: authors,
  [OldCollectionNames.Users]: users,
  [OldCollectionNames.DiscordServers]: discordServers,
  [OldCollectionNames.Species]: species,
  [OldCollectionNames.UserMeta]: userMeta,
  [CollectionNames.Events]: events,
  [CollectionNames.Playlists]: playlists,
  [CollectionNames.Pages]: pages
}
