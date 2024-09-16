export interface SocialMediaUsernames {
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

export interface UserMeta {
  patreonstatus: string
  linkedvrchatuserid: string
  vrchatlinkcode: number
}

export enum UserRoles {
  User = 'user',
  Editor = 'editor',
  Admin = 'admin',
}

export interface UserAdminMeta {
  role: UserRoles
}

export interface FullUser extends User, UserMeta, UserAdminMeta {}

export const CollectionNames = {
  Users: 'users',
  UsersMeta: 'usermeta',
  UsersAdminMeta: 'useradminmeta',
}
