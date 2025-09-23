import categoryMetas from '@/category-meta'
import { EditableField } from '.'
import { fieldTypes } from '../generic-forms'
import { Asset, AssetCategory } from '../modules/assets'
import {
  BANNER_HEIGHT,
  BANNER_WIDTH,
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

const fields: EditableField<Asset>[] = [
  {
    name: 'sourceurl',
    label: 'Source URL',
    type: fieldTypes.url,
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
    name: 'category',
    label: 'Category',
    type: fieldTypes.dropdown,
    options: Object.values(AssetCategory).map((category) => ({
      value: category,
      label: categoryMetas[category].nameSingular,
    })),
  },
  {
    name: 'title',
    label: 'Title',
    type: fieldTypes.text,
  },
  {
    name: 'thumbnailurl',
    label: 'Thumbnail URL',
    type: fieldTypes.imageUpload,
    requiredWidth: THUMBNAIL_WIDTH,
    requiredHeight: THUMBNAIL_HEIGHT,
    bucketName: bucketNames.assetThumbnails,
    getDirectoryPath: (fields) => fields.id,
    maxSizeBytes: NONATTACHMENT_MAX_SIZE_BYTES,
  },
  {
    name: 'bannerurl',
    label: 'Banner URL',
    type: fieldTypes.imageUpload,
    requiredWidth: BANNER_WIDTH,
    requiredHeight: BANNER_HEIGHT,
    getDirectoryPath: (fields) => fields.id,
    bucketName: bucketNames.assetBanners,
    maxSizeBytes: NONATTACHMENT_MAX_SIZE_BYTES,
  },
  {
    name: 'author',
    label: 'Author',
    type: fieldTypes.custom,
    renderer: ({ value, onChange }: any) => (
      <ChangeAuthorForm
        collectionName="abc" // TODO: ignore this
        id={false}
        existingAuthorId={value}
        overrideSave={onChange}
      />
    ),
  },
  // TODO: work out a better way to edit this in mini editor
  // {
  //   name: 'description',
  //   label: 'Description',
  //   type: fieldTypes.textMarkdown,
  // },
  {
    name: 'species',
    label: 'Species',
    type: fieldTypes.custom,
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
    label: 'Is Adult',
    alwaysShowLabel: true,
    type: fieldTypes.checkbox,
    hint: nsfwRules,
  },
  {
    name: 'pricecurrency',
    label: 'Price Currency',
    type: fieldTypes.dropdown,
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
    renderer: ({ value, onChange, formFields }) => (
      <PriceInput
        value={value as any}
        onChange={(newPrice) => onChange(newPrice as any)} // TODO: fix up types
        priceCurrency={formFields.pricecurrency || null}
      />
    ),
  },
  {
    name: 'tags',
    label: 'Tags',
    type: fieldTypes.tags,
    showRecommendedTags: true,
  },
  {
    name: 'relations',
    label: 'Relations',
    type: fieldTypes.custom,
    renderer: ({ value, onChange }) => (
      <RelationsEditor
        assetId={null}
        currentRelations={value}
        onChange={(newRelations) => onChange(newRelations as any)} // TODO: fix up types
      />
    ),
  },
]

export default fields
