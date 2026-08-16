import { NotificationEvent } from '@/notifications'
import { AiEvaluateQueuedItem } from './aievaluation'
import { AccessStatus } from './common'
import { Species } from './species'
import { RepChange, RepReason } from './reputation'

// minimal data shared between ALL views
export interface CoreUserFields extends Record<string, unknown> {
  id: string
  username: string
  avatarurl: string | null
  reputation: number
  banstatus: BanStatus
  accessstatus: AccessStatus
  role: UserRoles
  createdat: string // date
}

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

export interface User extends CoreUserFields, SocialMediaUsernames {
  id: string

  // basic stuff
  username: string
  avatarurl: string | null
  favoritespecies: string | null
  bio: string | null

  // meta
  lastmodifiedby: string | null
  lastmodifiedat: string | null // date
  createdby: string | null // can be null as they create themselves
  createdat: string // date
}

export enum PatreonStatus {
  Patron = 'patron',
  NotPatron = 'not_patron',
  Unknown = 'unknown',
}

export interface UserMeta extends Record<string, unknown> {
  patreonstatus: PatreonStatus
  patreonrewardids: number[] | null
  linkedvrchatuserid: string | null
  vrchatlinkcode: number | null
  discorduserid: number | null
  banstatus: BanStatus
  banreason: string | null
  accessstatus: AccessStatus // when user wants to delete their account
  reputation: number // int
}

export type NotificationPreferencesMethods = { [methodName: string]: boolean }
export type NotificationPreferencesEvents = { [eventName: string]: boolean }

export interface NotificationPreferences {
  methods: NotificationPreferencesMethods
  events: NotificationPreferencesEvents
}

export interface UserPreferences extends Record<string, unknown> {
  id: string
  enabledadultcontent: boolean
  notificationemail: string
  notificationprefs: NotificationPreferences
  tagblacklist: string[]
  showmoreinfo: boolean
  ispatronpublic: boolean
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

export interface UserStats {
  assetcount: number
  amendmentcount: number
  commentcount: number
}

export interface FullUserRepChange {
  reason: string
  delta: number
  reasondata: RepReason
}

export interface FullUser extends User, UserMeta, UserAdminMeta {
  ispatronpublic: boolean
  favoritespeciesdata: Species
  stats: UserStats
  repchanges: FullUserRepChange[]
}

export interface FullUser_Editor extends FullUser {
  botscore: number | null
  aievaluation: AiEvaluateQueuedItem | null
}

export interface UserForList {
  id: string
  username: string // not null as filtered by view
  avatarurl: string | null
  reputation: number
  accessstatus: AccessStatus
  banstatus: BanStatus
  role: UserRoles
  createdat: string // date
}

export interface PatronUserForList extends UserForList {
  patreonstatus: PatreonStatus
}

export interface UserFromView {
  id: string
  username: string
}

export enum CollectionNames {
  Users = 'users',
  UsersMeta = 'usermeta',
  UsersAdminMeta = 'useradminmeta',
  UserPreferences = 'userpreferences',
}

export enum ViewNames {
  GetUsersForList = 'getusersforlist',
  GetFullUsers = 'getfullusers',
  GetStaffUsers = 'getstaffusers',
  GetMyUser = 'getmyuser',
}

// from view GetMyUser
export interface MyUser extends User, UserMeta, UserAdminMeta, UserPreferences {
  favoritespeciesdata: Species
}

export const getIsFullUser = (user: User | FullUser): user is FullUser =>
  'role' in user
