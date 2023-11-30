export interface DiscordServerFields {
  name: string
  description?: string
  widgetid?: string
  iconurl?: string
  inviteurl?: string
  requirespatreon?: boolean
  patreonurl?: string
  species?: string[]
}

export interface DiscordServer extends DiscordServerFields {
  id: string
  lastmodifiedat?: string
  lastmodifiedby?: string
  createdat?: string
  createdby?: string
}

export const CollectionNames = {
  DiscordServers: 'discordservers',
}
