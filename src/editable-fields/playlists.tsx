import React from 'react'
import { fieldTypes } from '../generic-forms'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from '../config'
import PlaylistItemsEditor from '../components/playlist-items-editor'
import { bucketNames } from '../file-uploading'
import { EditableField } from './'
import { CollectionItem, FullCollection } from '../modules/collections'

const fields: EditableField<FullCollection, CollectionItem[]>[] = [
  {
    name: 'title',
    label: 'Title',
    type: fieldTypes.text,
    isRequired: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: fieldTypes.textMarkdown,
    default: '',
  },
  {
    name: 'thumbnailurl',
    label: 'Thumbnail',
    type: fieldTypes.imageUpload,
    imageUploadProperties: {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      bucketName: bucketNames.playlistThumbnails,
    },
    default: '',
  },
  {
    name: 'items',
    label: 'Assets',
    type: fieldTypes.custom,
    customProperties: {
      renderer: ({ onChange, value, databaseResult }) => (
        <PlaylistItemsEditor
          currentItems={value}
          onChange={onChange}
          assetsData={databaseResult ? databaseResult.itemsassetdata : []}
        />
      ),
    },
  },
]

export default fields
