import {
  AssetFieldNames,
  AssetAmendmentFieldNames,
  AssetCategories
} from '../hooks/useDatabaseQuery'
import { fieldTypes } from '../generic-forms'
import {
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  paths,
  BANNER_WIDTH,
  BANNER_HEIGHT
} from '../config'

export default [
  {
    name: AssetAmendmentFieldNames.fields,
    label: 'Fields',
    type: fieldTypes.map,
    fieldProperties: {
      fields: [
        {
          name: AssetFieldNames.title,
          label: 'Title',
          type: fieldTypes.text,
          stripIfUndefined: true
        },
        {
          name: AssetFieldNames.isAdult,
          label: 'Is adult',
          type: fieldTypes.checkbox,
          stripIfUndefined: true
        },
        {
          name: AssetFieldNames.tags,
          label: 'Tags',
          type: fieldTypes.tags,
          stripIfUndefined: true
        },
        {
          name: AssetFieldNames.category,
          label: 'Category',
          type: fieldTypes.singlechoice,
          options: Object.entries(AssetCategories).map(([key, value]) => ({
            label: key,
            value
          })),
          stripIfUndefined: true
        },
        // { name: AssetFieldNames.species, label: 'species', type: FOO, stripIfUndefined: true },
        {
          name: AssetFieldNames.sourceUrl,
          label: 'Source URL',
          type: fieldTypes.text,
          stripIfUndefined: true
        },
        {
          name: AssetFieldNames.videoUrl,
          label: 'Video URL',
          type: fieldTypes.text,
          stripIfUndefined: true
        },
        {
          name: AssetFieldNames.thumbnailUrl,
          label: 'Thumbnail',
          type: fieldTypes.imageUpload,
          fieldProperties: {
            width: THUMBNAIL_WIDTH,
            height: THUMBNAIL_HEIGHT,
            directoryName: paths.assetThumbnailDir
          },
          stripIfUndefined: true
        },
        // { name: AssetFieldNames.fileUrls, label: 'fileUrls', type: FOO, stripIfUndefined: true },
        {
          name: AssetFieldNames.description,
          label: 'Description',
          type: fieldTypes.textMarkdown,
          stripIfUndefined: true
        },
        // { name: AssetFieldNames.author, label: 'author', type: FOO, stripIfUndefined: true },
        // { name: AssetFieldNames.children, label: 'children', type: FOO, stripIfUndefined: true },
        // { name: AssetFieldNames.ownedBy, label: 'ownedBy', type: FOO, stripIfUndefined: true },
        // { name: AssetFieldNames.isPinned, label: 'isPinned', type: fieldTypes., stripIfUndefined: true },
        // { name: AssetFieldNames.discordServer, label: 'discordServer', type: FOO, stripIfUndefined: true },
        {
          name: AssetFieldNames.bannerUrl,
          label: 'Banner',
          type: fieldTypes.imageUpload,
          fieldProperties: {
            width: BANNER_WIDTH,
            height: BANNER_HEIGHT,
            directoryName: paths.assetBannerDir
          },
          stripIfUndefined: true
        },
        // { name: AssetFieldNames.tutorialSteps, label: 'tutorialSteps', type: FOO, stripIfUndefined: true },
        // { name: AssetFieldNames.pedestalVideoUrl, label: 'pedestalVideoUrl', type: FOO, stripIfUndefined: true },
        // { name: AssetFieldNames.pedestalFallbackImageUrl, label: 'pedestalFallbackImageUrl', type: FOO, stripIfUndefined: true },
        {
          name: AssetFieldNames.sketchfabEmbedUrl,
          label: 'Sketchfab Embed URL',
          type: fieldTypes.text,
          stripIfUndefined: true
        }
      ]
    }
  },
  {
    name: AssetAmendmentFieldNames.comments,
    label: 'Comments',
    type: fieldTypes.text,
    isRequired: true,
    hint:
      'Explain why you are amending the asset. Did they forget a tag? Did you find a better thumbnail?'
  },
  {
    name: AssetAmendmentFieldNames.isRejected,
    type: fieldTypes.hidden,
    default: null
  }
]
