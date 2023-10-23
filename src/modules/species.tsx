import React from 'react'
import SpeciesResultItem from '../components/species-result-item'
import { EditableField } from '../editable-fields'
import { fieldTypes } from '../generic-forms'
import { SpeciesFieldNames } from '../hooks/useDatabaseQuery'

export interface Species {
  id: string
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
  lastmodifiedat: Date
  lastmodifiedby: string
  createdat: Date
  createdby: string
}

export const CollectionNames = {
  Species: 'species'
}

export const editableFields: EditableField[] = [
  {
    name: SpeciesFieldNames.parent,
    label: 'Parent',
    type: fieldTypes.searchable,
    hint: 'If this is a child of a Genus (avoid nesting too many levels)',
    fieldProperties: {
      collectionName: CollectionNames.Species,
      fieldAsLabel: SpeciesFieldNames.pluralName,
      renderer: ({ item }: { item: Species }) => (
        <SpeciesResultItem species={item} />
      )
    }
  },
  {
    name: SpeciesFieldNames.singularName,
    label: 'Name (singular)',
    type: fieldTypes.text,
    isRequired: true,
    hint: 'A single of them - "Dog" (not "Dogs")'
  },
  {
    name: SpeciesFieldNames.pluralName,
    label: 'Name (plural)',
    type: fieldTypes.text,
    isRequired: true,
    hint: 'Multiple of them - "Dogs" (not "Dog")'
  },
  {
    name: SpeciesFieldNames.shortDescription,
    label: 'Short Description',
    type: fieldTypes.text,
    length: 100,
    hint:
      'A short sentence used to describe the species in a list view. 100 characters. Do not mention who created the species (if applicable). Avoid mentioning the species name (it is redundant).'
  },
  {
    name: SpeciesFieldNames.description,
    label: 'Description',
    type: fieldTypes.textMarkdown,
    length: 300,
    hint:
      'A longer description of the species used to describe the species in a full view. 300 characters, 1 or 2 sentences max. If created by a specific person, mention at the very end (eg. "Originally created by [Username](./link/to/source).". Do not mention if closed or open species. Avoid mentioning the species name (it is redundant).'
  },
  {
    name: SpeciesFieldNames.thumbnailUrl,
    label: 'Thumbnail',
    type: fieldTypes.imageUpload,
    fieldProperties: {
      width: 300,
      height: 300,
      directoryName: 'species-thumbnails'
    },
    isRequired: true,
    hint:
      'Use a dark image so it is easier on the eyes. Prefer an anthro version of the species as it is for VRChat.'
  },
  {
    name: SpeciesFieldNames.thumbnailSourceUrl,
    label: 'Thumbnail source URL',
    type: fieldTypes.text,
    hint:
      'The website or tweet or whatever that you found the image above. Respect authors!'
  }
]
