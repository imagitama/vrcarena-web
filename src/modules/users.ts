export interface User {
  id: string

  // basic stuff
  username: string
  avatarurl: string
  favoritespecies: string

  // profile
  vrchatuserid: string
  vrchatusername: string
  discordusername: string
  twitterusername: string
  telegramusername: string
  youtubechannelid: string
  twitchusername: string
  bio: string
  neosvrusername: string
  chilloutvrusername: string
  patreonusername: string

  // meta
  lastmodifiedby: string
  lastmodifiedat: Date
  createdby: string
  createdat: Date
}

export interface FullUser {}

export const CollectionNames = {
  Users: 'users',
  // TODO: Pluralize these
  UsersMeta: 'usermeta',
  UsersAdminMeta: 'useradminmeta'
}
