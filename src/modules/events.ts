import { FeaturedStatus } from './common'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '../config'
import { EditableField } from '../editable-fields'
import { fieldTypes } from '../generic-forms'
import { bucketNames } from '../file-uploading'

export const EVENT_BANNER_WIDTH = 600
export const EVENT_BANNER_HEIGHT = 300

export interface Event {
  id: string
  name: string
  description: string
  sourceurl: string
  thumbnailurl: string
  bannerurl: string
  attachmentids: string[]
  speciesids: string[]
  assetids: string[]
  discordserverid: string
  isadult: boolean
  startsat: Date
  endsat: Date
  assettags: string[]
  slug: string
  lastmodifiedat: Date
  lastmodifiedby: string
  createdat: Date
  createdby: string
}

export interface EventMeta {
  id: string
  editornotes: string
  approvalstatus: string
  accessstatus: string
  featuredstatus: FeaturedStatus
  lastmodifiedat: Date
  lastmodifiedby: string
  createdat: Date
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

// export enum UnusableAttendanceStatus {
//   Abstain = 'abstain', // if they chose a status then reversed it - should never be returned in public views
// }

export namespace AttendanceStatus {
  export const Abstain: AttendanceStatus = 'abstain' as AttendanceStatus
}

export interface EventAttendance {
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

export const CollectionNames = {
  Events: 'events',
  EventsMeta: 'eventsmeta',
  EventAttendance: 'eventattendance',
}

export const ViewNames = {
  GetFullEvents: 'getfullevents',
  GetPublicEvents: 'getpublicevents',
}

export const EditableFields: EditableField<Event>[] = [
  {
    name: 'name',
    label: 'Name',
    type: fieldTypes.text,
    hint: 'The name of the event. Keep it short but descriptive.',
  },
  // TODO: Delete this and replace with auto-generated from name like we do for assets
  // authors with sales etc. should just use the ID
  // {
  //   name: 'slug',
  //   label: 'Slug',
  //   type: fieldTypes.text,
  //   hint: 'A shortened name for the event. Used in the URL. Replace spaces with dashes. eg. "furality-aqua-2023"',
  // },
  {
    name: 'description',
    label: 'Description',
    type: fieldTypes.textMarkdown,
    hint: 'Explain what your event is, who can come, how to join.',
  },
  {
    name: 'sourceurl',
    label: 'URL',
    type: fieldTypes.text,
    hint: 'The URL to the website for the event. Must contain https://',
  },
  {
    name: 'thumbnailurl',
    label: 'Thumbnail',
    type: fieldTypes.imageUpload,
    imageUploadProperties: {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      bucketName: bucketNames.eventThumbnails,
    },
    hint: 'A thumbnail used for your event. Used in search results etc.',
  },
  {
    name: 'bannerurl',
    label: 'Banner',
    type: fieldTypes.imageUpload,
    imageUploadProperties: {
      width: EVENT_BANNER_WIDTH,
      height: EVENT_BANNER_HEIGHT,
      bucketName: bucketNames.eventBanners,
    },
    hint: `The image to display in the header of the site if it is featured. ${EVENT_BANNER_WIDTH} width ${EVENT_BANNER_HEIGHT} height with transparent background.`,
  },
  {
    name: 'isadult',
    label: 'Is Adult',
    type: fieldTypes.checkbox,
    default: false,
    hint: 'If the event is NSFW. If enabled the event will never be shown to users unless they opt-in to NSFW content.',
  },
  {
    name: 'startsat',
    label: 'Starts At',
    type: fieldTypes.date,
    hint: 'When the event starts. In your local timezone.',
  },
  {
    name: 'endsat',
    label: 'Ends At',
    type: fieldTypes.date,
    hint: 'When the event ends. In your local timezone.',
  },
  {
    name: 'assettags',
    label: 'Display any assets that have these tags',
    type: fieldTypes.tags,
  },
]
