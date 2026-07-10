import { AccessStatus, ApprovalStatus, FeaturedStatus } from './common'
import {
  BANNER_HEIGHT,
  BANNER_WIDTH,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
} from '@/config'
import { EditableField } from '@/editable-fields'
import { fieldTypes } from '@/generic-forms'
import { bucketNames } from '@/file-uploading'

export const EVENT_BANNER_WIDTH = 600
export const EVENT_BANNER_HEIGHT = 300

export interface BasicEvent {
  id: string
  name: string
  bannerurl: string
  slug: string
  startsat: string // date
  endsat: string // date
}

export interface Event extends BasicEvent {
  description: string
  sourceurl: string
  thumbnailurl: string
  attachmentids: string[]
  speciesids: string[]
  assetids: string[]
  discordserverid: string
  isadult: boolean
  assettags: string[]
  isbackground: boolean
  lastmodifiedat: string // date
  lastmodifiedby: string
  createdat: string // date
  createdby: string
}

export interface EventMeta {
  id: string
  editornotes: string
  approvalstatus: ApprovalStatus
  accessstatus: AccessStatus
  featuredstatus: FeaturedStatus
  lastmodifiedat: string // date
  lastmodifiedby: string
  createdat: string // date
  createdby: string
}

export interface PublicEvent extends Event {
  featuredstatus: FeaturedStatus
}

export enum AttendanceStatus {
  Accepted = 'accepted',
  Maybe = 'maybe',
  Declined = 'declined',
}

export namespace AttendanceStatus {
  export const Abstain: AttendanceStatus = 'abstain' as AttendanceStatus
}

export interface EventAttendance extends Record<string, any> {
  id: string
  event: string // id
  status: AttendanceStatus
  lastmodifiedat: Date
  lastmodifiedby: string
  createdat: Date
  createdby: string
}

export interface FullEventAttendance extends EventAttendance {
  createdbyusername: string
  createdbyavatarurl: string
}

export interface FullEvent extends Event, EventMeta {
  attendance: FullEventAttendance[]
}

export enum CollectionNames {
  Events = 'events',
  EventsMeta = 'eventsmeta',
  EventAttendance = 'eventattendance',
}

export enum ViewNames {
  GetFullEvents = 'getfullevents',
  GetPublicEvents = 'getpublicevents',
}

export enum BucketNames {
  EventThumbnails = 'event-thumbnails',
  EventBanners = 'event-banners',
}

export const EditableFields: EditableField<Event>[] = [
  {
    name: 'name',
    label: 'Name',
    type: fieldTypes.text,
    hint: 'The name of the event. Keep it short but descriptive.',
    isRequired: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: fieldTypes.textMarkdown,
    hint: 'Explain what your event is, who can come, how to join.',
    isRequired: true,
  },
  {
    name: 'sourceurl',
    label: 'URL',
    type: fieldTypes.url,
    hint: 'The URL to the website for the event. Must contain https://',
  },
  {
    name: 'thumbnailurl',
    label: 'Thumbnail',
    type: fieldTypes.imageUpload,
    requiredWidth: THUMBNAIL_WIDTH,
    requiredHeight: THUMBNAIL_HEIGHT,
    bucketName: BucketNames.EventThumbnails,
    hint: 'A thumbnail used for your event. Used in search results etc.',
  },
  {
    name: 'isadult',
    label: 'Is Adult',
    type: fieldTypes.checkbox,
    default: false,
    hint: 'If the event is NSFW. If enabled the event will never be shown to users unless they opt-in to NSFW content.',
  },
  {
    // @ts-ignore
    name: 'startsat_endsat',
    label: 'Date/Time',
    type: fieldTypes.dateRange,
    hint: 'When the event starts and ends.',
    isRequired: false, // perform validation at startsat/endsat
    startsAtFieldName: 'startsat',
    endsAtFieldName: 'endsat',
  },
  {
    name: 'startsat',
    label: 'Starts At',
    type: fieldTypes.date,
    hint: 'When the event ends.',
    isRequired: true,
    isEditable: false, // needed so formFields is populated for startsat.endsAtFieldName
  },
  {
    name: 'endsat',
    label: 'Ends At',
    type: fieldTypes.date,
    hint: 'When the event ends.',
    isRequired: true,
    isEditable: false, // needed so formFields is populated for startsat.endsAtFieldName
  },
  {
    name: 'bannerurl',
    label: 'Banner',
    type: fieldTypes.imageUpload,
    requiredWidth: BANNER_WIDTH,
    requiredHeight: BANNER_HEIGHT,
    bucketName: BucketNames.EventBanners,
    hint: 'Shown at the top of the page when the event is featured',
  },
  {
    name: 'assettags',
    label: 'Display any assets that have these tags',
    type: fieldTypes.tags,
    showRecommendedTags: false,
    hint: 'Anyone viewing the event will see any asset that has one of these tags. eg. "new_years_eve", "furality", "pride", "rainbow"',
  },
]
