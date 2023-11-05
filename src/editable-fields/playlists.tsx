import React from 'react'
import { PlaylistsFieldNames } from '../data-store'
import { fieldTypes } from '../generic-forms'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from '../config'
import PlaylistItemsEditor from '../components/playlist-items-editor'
import { bucketNames } from '../file-uploading'
import { EditableField } from './'

const fields: EditableField<any>[] = [
  {
    name: PlaylistsFieldNames.title,
    label: 'Title',
    type: fieldTypes.text,
    isRequired: true
  },
  {
    name: PlaylistsFieldNames.description,
    label: 'Description',
    type: fieldTypes.textMarkdown,
    default: ''
  },
  {
    name: PlaylistsFieldNames.thumbnailUrl,
    label: 'Thumbnail',
    type: fieldTypes.imageUpload,
    imageUploadProperties: {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      bucketName: bucketNames.playlistThumbnails
    },
    default: ''
  },
  {
    name: PlaylistsFieldNames.items,
    label: 'Assets',
    type: fieldTypes.custom,
    customProperties: {
      renderer: ({ onChange, value, databaseResult }) => (
        <PlaylistItemsEditor
          items={value}
          onChange={onChange}
          itemsAssetData={databaseResult ? databaseResult.itemsassetdata : []}
        />
      )
    }
  }
]

export default fields
