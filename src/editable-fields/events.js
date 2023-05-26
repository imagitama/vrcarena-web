import React from 'react'
import {
  CollectionNames,
  AssetFieldNames,
  DiscordServerFieldNames
} from '../hooks/useDatabaseQuery'
import { fieldTypes } from '../generic-forms'
import { EventsFieldNames } from '../data-store'
import {
  BANNER_HEIGHT,
  BANNER_WIDTH,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '../config'

export default [
  {
    name: EventsFieldNames.name,
    label: 'Name',
    type: fieldTypes.text,
    hint: 'The name of the event. Keep it short but descriptive.'
  },
  {
    name: EventsFieldNames.description,
    label: 'Description',
    type: fieldTypes.textMarkdown,
    hint: 'Explain what your event is, who can come, how to join.'
  },
  {
    name: EventsFieldNames.sourceUrl,
    label: 'URL',
    type: fieldTypes.text,
    hint: 'The URL to the website for the event. Must contain https://'
  },
  {
    name: EventsFieldNames.thumbnailUrl,
    label: 'Thumbnail',
    type: fieldTypes.imageUpload,
    fieldProperties: {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      directoryName: 'event-thumbnails'
    },
    hint: 'A thumbnail used for your event. Used in search results etc.'
  },
  {
    name: EventsFieldNames.bannerUrl,
    label: 'Banner',
    type: fieldTypes.imageUpload,
    fieldProperties: {
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      directoryName: 'event-banners'
    },
    hint: 'A banner used to improve the appearance of your event. Optional.'
  },
  //   {
  //     name: EventsFieldNames.attachmentids,
  //     label: 'Attachments',
  //     type: fieldTypes.attachments,
  //     hint: 'Any attachments for your event such as images or PDFs or anything.'
  //   },
  // {
  //   name: EventsFieldNames.assetIds,
  //   label: 'Assets',
  //   type: fieldTypes.assets,
  //   default: [],
  //   fieldProperties: {
  //     collectionName: CollectionNames.Assets,
  //     indexName: CollectionNames.Assets,
  //     fieldAsLabel: AssetFieldNames.title,
  //     renderer: ({ item }) => <div>{item[AssetFieldNames.title]}</div>
  //   },
  //   hint:
  //     'Any assets you want to link to the event. eg. if a Rexouium meetup you can link the avatar here'
  // },
  // {
  //   name: EventsFieldNames.discordServerId,
  //   label: 'Discord Server',
  //   type: fieldTypes.searchable,
  //   fieldProperties: {
  //     collectionName: CollectionNames.DiscordServers,
  //     indexName: CollectionNames.DiscordServers,
  //     fieldAsLabel: DiscordServerFieldNames.name,
  //     renderer: ({ item }) => <div>{item[DiscordServerFieldNames.name]}</div>
  //   },
  //   hint:
  //     'If the event is for a Discord Server you can set that here. A message will be shown to explain you might need to join the server to participate.'
  // },
  // {
  //   name: EventsFieldNames.isAdult,
  //   label: 'Is Adult',
  //   type: fieldTypes.checkbox,
  //   default: false,
  //   hint:
  //     'If the event is NSFW. If enabled the event will never be shown to users unless they opt-in to NSFW content.'
  // },
  {
    name: EventsFieldNames.startsAt,
    label: 'Starts At',
    type: fieldTypes.date,
    hint: 'When the event starts. In your local timezone.'
  },
  {
    name: EventsFieldNames.endsAt,
    label: 'Ends At',
    type: fieldTypes.date,
    hint: 'When the event ends. In your local timezone.'
  },
  {
    name: EventsFieldNames.assetTags,
    label: 'Display any assets that have these tags',
    type: fieldTypes.tags
  }
]
