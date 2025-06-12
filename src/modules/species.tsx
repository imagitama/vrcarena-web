import React from 'react'
import SpeciesResultItem from '../components/species-result-item'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '../config'
import { EditableField } from '../editable-fields'
import { bucketNames } from '../file-uploading'
import { fieldTypes } from '../generic-forms'
import { AccessStatus } from './common'

export interface SpeciesFields extends Record<string, any> {
  parent: string
  type: 'genus' | 'species'
  singularname: string
  pluralname: string
  description: string
  shortdescription: string
  thumbnailurl: string
  fallbackthumbnailurl: string
  thumbnailsourceurl: string
  ispopular: boolean
  slug: string
  redirectto: string // ID
  tags: string[] // for easier filtering
}

export interface Species extends SpeciesFields {
  id: string
  lastmodifiedat: Date
  lastmodifiedby: string
  createdat: Date
  createdby: string
}

export interface FullSpecies extends Species {
  parentpluralname: string | null
  avatarcount: number
}

export enum CollectionNames {
  Species = 'species',
}

export enum ViewNames {
  GetFullSpecies = 'getfullspecies',
  GetPublicSpeciesCache = 'getpublicspeciescache',
}

export const editableFields: EditableField<Species>[] = [
  {
    name: 'parent',
    label: 'Parent',
    type: fieldTypes.searchable,
    hint: 'If this is a child of a Genus (avoid nesting too many levels)',
    searchableProperties: {
      collectionName: CollectionNames.Species,
      fieldAsLabel: 'pluralname',
      renderer: ({ item }: { item: Species }) => (
        <SpeciesResultItem speciesItem={item} />
      ),
    },
  },
  {
    name: 'singularname',
    label: 'Name (singular)',
    type: fieldTypes.text,
    isRequired: true,
    hint: 'A single of them - "Dog" (not "Dogs")',
  },
  {
    name: 'pluralname',
    label: 'Name (plural)',
    type: fieldTypes.text,
    isRequired: true,
    hint: 'Multiple of them - "Dogs" (not "Dog")',
  },
  {
    name: 'tags',
    label: 'Tags',
    type: fieldTypes.tags,
    hint: 'Used when filtering or searching species to help people find their species',
  },
  {
    name: 'shortdescription',
    label: 'Short Description',
    type: fieldTypes.text,
    length: 100,
    hint: 'A short sentence used to describe the species in a list view. 100 characters. Do not mention who created the species (if applicable). Avoid mentioning the species name (it is redundant).',
  },
  {
    name: 'description',
    label: 'Description',
    type: fieldTypes.textMarkdown,
    length: 300,
    hint: 'A longer description of the species used to describe the species in a full view. 300 characters, 1 or 2 sentences max. If created by a specific person, mention at the very end (eg. "Originally created by [Username](./link/to/source).". Do not mention if closed or open species. Avoid mentioning the species name (it is redundant).',
  },
  {
    name: 'thumbnailurl',
    label: 'Thumbnail',
    type: fieldTypes.imageUpload,
    imageUploadProperties: {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      bucketName: bucketNames.speciesThumbnails,
    },
    hint: 'Use a dark image so it is easier on the eyes. Prefer an anthro version of the species as it is for VRChat.',
  },
  {
    name: 'thumbnailsourceurl',
    label: 'Thumbnail source URL',
    type: fieldTypes.text,
    hint: 'The website or social media post or whatever that you found the image above. Respect authors!',
  },
  {
    name: 'redirectto',
    label: 'Redirect',
    type: fieldTypes.searchable,
    hint: 'Redirect every visit to this species to another species',
    searchableProperties: {
      collectionName: CollectionNames.Species,
      fieldAsLabel: 'pluralname',
      renderer: ({ item }: { item: Species }) => (
        <SpeciesResultItem speciesItem={item} />
      ),
    },
  },
  {
    name: 'accessstatus',
    label: 'Access',
    type: fieldTypes.singlechoice,
    options: [AccessStatus.Public, AccessStatus.Deleted].map((item) => ({
      label: item,
      value: item,
    })),
  },
]
