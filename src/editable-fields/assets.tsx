import categoryMetas from '@/category-meta'
import { EditableField } from '.'
import { fieldTypes } from '../generic-forms'
import { Asset, AssetCategory, CollectionNames } from '../modules/assets'
import {
  ASSET_TITLE_MAX_LENGTH,
  ASSET_TITLE_MIN_LENGTH,
  NONATTACHMENT_MAX_SIZE_BYTES,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
  nsfwRules,
} from '@/config'
import React from 'react'
import { bucketNames } from '@/file-uploading'
import { popularCurrencies } from '@/currency'
import PriceInput from '@/components/price-input'
import ChangeSpeciesEditor from '@/components/change-species-editor'
import ChangeAuthorForm from '@/components/change-author-form'
import ExtraSourcesEditor from '@/components/extra-sources-editor'
import RelationsEditor from '@/components/relations-editor'
import ChangeDiscordServerForm from '@/components/change-discord-server-form'
import VrchatAvatarIdsForm from '@/components/vrchat-avatar-ids-form'
import AttachmentsForm from '@/components/attachments-form'
import { AttachmentReason } from '@/modules/attachments'

const fields: EditableField<Asset>[] = [
  {
    name: 'category',
    label: 'Category',
    type: fieldTypes.singlechoice,
    options: Object.values(AssetCategory).map((category) => ({
      value: category,
      label: categoryMetas[category].nameSingular,
    })),
    isRequired: true,
  },
  {
    name: 'sourceurl',
    label: 'Main Source URL',
    type: fieldTypes.url,
    hint: 'The recommended source of the asset.',
    isRequired: true,
  },
  {
    name: 'pricecurrency',
    label: 'Price Currency',
    type: fieldTypes.dropdown,
    default: null,
    options: Object.entries(popularCurrencies).map(
      ([threeLetterCurrency, name]) => ({
        value: threeLetterCurrency,
        label: `${threeLetterCurrency} (${name})`,
      })
    ),
  },
  {
    name: 'price',
    label: 'Price',
    type: fieldTypes.custom,
    default: null,
    renderer: ({ value, onChange, formFields }) => (
      <PriceInput
        value={value as any}
        onChange={(newPrice) => onChange(newPrice as any)} // TODO: fix up types
        priceCurrency={formFields.pricecurrency || null}
      />
    ),
  },
  {
    name: 'extrasources',
    label: 'Extra Sources',
    type: fieldTypes.custom,
    renderer: ({ value, onChange }) => (
      <ExtraSourcesEditor
        assetId={null}
        extraSources={value as any}
        onChange={(newSources) => onChange(newSources as any)}
      />
    ),
  },
  {
    name: 'title',
    label: 'Title',
    type: fieldTypes.text,
    isRequired: true,
    minLength: ASSET_TITLE_MIN_LENGTH,
    maxLength: ASSET_TITLE_MAX_LENGTH,
    hint: 'A short, descriptive name of the asset. Avoid any redundancy like the words "avatar" or "accessory".',
  },
  {
    name: 'thumbnailurl',
    label: 'Thumbnail URL',
    type: fieldTypes.imageUpload,
    isRequired: true,
    hint: 'A static square image used anywhere the asset is displayed on the site.',
    requiredWidth: THUMBNAIL_WIDTH,
    requiredHeight: THUMBNAIL_HEIGHT,
    bucketName: bucketNames.assetThumbnails,
    getDirectoryPath: (fields) => fields.id,
    maxSizeBytes: NONATTACHMENT_MAX_SIZE_BYTES,
  },
  // disabled sep 2025 for bandwidth
  // {
  //   name: 'bannerurl',
  //   label: 'Banner URL',
  //   type: fieldTypes.imageUpload,
  //   requiredWidth: BANNER_WIDTH,
  //   requiredHeight: BANNER_HEIGHT,
  //   getDirectoryPath: (fields) => fields.id,
  //   bucketName: bucketNames.assetBanners,
  //   maxSizeBytes: NONATTACHMENT_MAX_SIZE_BYTES,
  // },
  {
    name: 'author',
    label: 'Author',
    type: fieldTypes.custom,
    renderer: ({ value, onChange }) => (
      <ChangeAuthorForm
        id={null}
        existingAuthorId={value}
        overrideSave={onChange as any}
      />
    ),
    isRequired: true,
    hint: 'Who actually created the asset. Authors are separate to the person who submits the asset.',
  },
  {
    name: 'description',
    label: 'Description',
    type: fieldTypes.textMarkdown,
    isRequired: true,
    allowImages: false,
  },
  {
    name: 'species',
    label: 'Species',
    type: fieldTypes.custom,
    default: [],
    renderer: ({ value, onChange }) => (
      <ChangeSpeciesEditor
        assetId={null}
        activeSpeciesIds={value || []}
        showControls={false}
        onChange={(newIds) => onChange(newIds as any)} // TODO: fix up types
      />
    ),
  },
  {
    name: 'isadult',
    label: 'Adult Toggle',
    checkboxLabel: 'Is adult',
    type: fieldTypes.checkbox,
    default: false,
    hint: nsfwRules,
    isRequired: true,
  },
  {
    name: 'tags',
    label: 'Tags',
    type: fieldTypes.tags,
    default: [],
    showRecommendedTags: true,
    showChatGptSuggestions: true,
  },
  {
    name: 'relations',
    label: 'Relations',
    type: fieldTypes.custom,
    default: [],
    renderer: ({ value, onChange }) => (
      <RelationsEditor
        assetId={null}
        currentRelations={value || []}
        onChange={(newRelations) => onChange(newRelations as any)} // TODO: fix up types
      />
    ),
  },
  {
    name: 'attachmentids',
    label: 'Attachments',
    type: fieldTypes.custom,
    default: [],
    renderer: ({ value, onChange, formFields }) => (
      <AttachmentsForm
        parentTable={CollectionNames.Assets}
        parentId={formFields.id} // TODO: support creating without ID
        reason={AttachmentReason.AssetFile}
        ids={(value as any) || []}
        attachmentsData={formFields.attachmentsdata}
        onChange={(newAttachmentIds) => onChange(newAttachmentIds as any)} // TODO: fix up types
      />
    ),
    hint: 'Images to help promote the asset. The first image is the most important and will always be shown to users.',
  },
  {
    name: 'discordserver',
    label: 'Required Discord Server',
    type: fieldTypes.custom,
    default: null,
    renderer: ({ value, onChange }) => (
      <ChangeDiscordServerForm
        assetId={null}
        initialValue={value || null}
        overrideSave={(newId) => onChange(newId as any)}
      />
    ),
  },
  {
    name: 'vrchatclonableavatarids',
    label: 'VRChat Avatar IDs',
    type: fieldTypes.custom,
    default: [],
    renderer: ({ value, onChange }) => (
      <VrchatAvatarIdsForm
        assetId={null}
        initialValue={value || []}
        onChange={onChange as any}
      />
    ),
    hint: `A list of VRChat avatars the user can "try before they buy".`,
  },
  {
    name: 'sketchfabembedurl',
    label: 'Sketchfab Embed URL',
    type: fieldTypes.url,
    default: null,
    hint: `1. View your Sketchfab model and above the Triangles and Vertices count click the Embed button
2. Check any options you want for your embed
3. Select "iframe" as the format and copy the HTML code
4. In a text editor find the URL of the iframe (the "src" attribute) and copy it here`,
  },
  {
    name: 'vccurl',
    label: 'VRChat Creator Companion URL',
    type: fieldTypes.url,
    default: null,
    hint: `Set to either a JSON file or a Git repo URL:

- https://vrchat-community.github.io/template-package/index.json
- https://github.com/vrchat-community/template-package.git

If the URL has no extension it is considered a Git repo.`,
  },
]

export default fields
