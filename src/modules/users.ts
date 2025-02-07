export interface SocialMediaUsernames extends Record<string, unknown> {
  // profile
  vrchatuserid: string
  vrchatusername: string
  discordusername: string
  twitterusername: string
  telegramusername: string
  youtubechannelid: string
  twitchusername: string
  neosvrusername: string
  chilloutvrusername: string
  patreonusername: string
}

export interface User extends SocialMediaUsernames {
  id: string

  // basic stuff
  username: string
  avatarurl: string
  favoritespecies: string
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
  linkedvrchatuserid: string
  vrchatlinkcode: number
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

export interface FullUser extends User, UserMeta, UserAdminMeta {}

export const CollectionNames = {
  Users: 'users',
  UsersMeta: 'usermeta',
  UsersAdminMeta: 'useradminmeta',
}
