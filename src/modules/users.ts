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

export enum Roles {
  User = 'user',
  Editor = 'editor',
  Admin = 'admin',
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

export interface UserMeta {
  patreonstatus: string
  linkedvrchatuserid: string
  vrchatlinkcode: number
}

export interface UserAdminMeta {
  role: Roles
}

export interface FullUser extends User, UserMeta, UserAdminMeta {}

export const CollectionNames = {
  Users: 'users',
  UsersMeta: 'usermeta',
  UsersAdminMeta: 'useradminmeta',
}
