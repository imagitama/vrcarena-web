import { AccessStatus } from './common'
import { Species } from './species'

export interface SocialMediaUsernames extends Record<string, unknown> {
  // profile
  vrchatuserid: string | null
  vrchatusername: string | null
  discordusername: string | null
  twitterusername: string | null
  telegramusername: string | null
  youtubechannelid: string | null
  twitchusername: string | null
  neosvrusername: string | null
  chilloutvrusername: string | null
  patreonusername: string | null
}

export interface User extends SocialMediaUsernames {
  id: string

  // basic stuff
  username: string
  avatarurl: string
  favoritespecies: string | null
  bio: string

  // meta
  lastmodifiedby: string
  lastmodifiedat: Date
  createdby: string
  createdat: Date
}

export enum PatreonStatus {
  Patron = 'patron',
  NotPatron = 'not_patron',
  Unknown = 'unknown',
}

export interface UserMeta extends Record<string, unknown> {
  patreonstatus: PatreonStatus
  patreonrewardids: number[]
  linkedvrchatuserid: string
  vrchatlinkcode: number
  discorduserid: number
  banstatus: BanStatus
  banreason: string
  accessstatus: AccessStatus
}

export enum BanStatus {
  Banned = 'banned',
  Unbanned = 'unbanned',
}

export enum UserRoles {
  User = 'user',
  Editor = 'editor',
  Admin = 'admin',
}

export interface UserAdminMeta {
  id: string
  role: UserRoles
}

export interface FullUser extends User, UserMeta, UserAdminMeta {
  favoritespeciesdata: Species
}

export enum CollectionNames {
  Users = 'users',
  UsersMeta = 'usermeta',
  UsersAdminMeta = 'useradminmeta',
}

export enum ViewNames {
  GetFullUsers = 'getfullusers',
  GetStaffUsers = 'getstaffusers',
}

export const getIsFullUser = (user: User | FullUser): user is FullUser =>
  'role' in user
