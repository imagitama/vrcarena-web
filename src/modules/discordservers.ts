import { AccessStatus, ApprovalStatus, PublishStatus } from './common'

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

export interface FullDiscordServer extends DiscordServer {
  publishstatus: PublishStatus
  accessstatus: AccessStatus
  approvalstatus: ApprovalStatus
  editornotes: string
}

export enum CollectionNames {
  DiscordServers = 'discordservers',
  DiscordServersMeta = 'discordserversmeta',
}

export enum ViewNames {
  GetFullDiscordServers = 'getfulldiscordservers',
  GetPublicDiscordServers = 'getpublicdiscordservers',
}
