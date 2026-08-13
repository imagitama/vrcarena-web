import { TagSuggestion, TagSuggestionType } from '@/modules/tagsuggestions'
import {
  Tag,
  TagFields,
  CollectionNames as TagsCollectionNames,
  editableFields as tagsEditableFields,
} from '@/modules/tags'
import { EditableField } from './'
import { fieldTypes } from '@/generic-forms'
import { capitalize } from '@/utils'
import TagDetails from '@/components/tag-details'
import GenericEditor from '@/components/generic-editor'

const editableFields: EditableField<TagSuggestion>[] = [
  {
    name: 'targettag',
    label: 'Existing Tag',
    type: fieldTypes.searchable,
    collectionName: TagsCollectionNames.Tags,
    allowEmpty: true,
    renderer: ({ item }: { item: Tag }) => <TagDetails tag={item} />,
    fieldAsLabel: 'id',
    hint: 'The existing tag that you want to modify or replace. Leave blank if you are suggesting a new tag.',
  },
  {
    name: 'type',
    label: 'Suggestion',
    type: fieldTypes.singlechoice,
    options: Object.values(TagSuggestionType).map((type) => ({
      value: type,
      label: capitalize(type),
    })),
    isRequired: true,
  },
  {
    name: 'relatedtag',
    label: 'Create Or Replace Tag With',
    type: fieldTypes.searchable,
    collectionName: TagsCollectionNames.Tags,
    allowEmpty: true,
    fieldAsLabel: 'id',
    renderer: ({ item }: { item: Tag }) => <TagDetails tag={item} />,
    allowManualEntry: true,
    hint: 'Another tag that you want to create or replace the tag with.',
  },
  {
    name: 'fields',
    label: 'Suggested Tag Fields',
    type: fieldTypes.custom,
    renderer: ({ value, onChange }) => (
      <div style={{ paddingLeft: '2rem' }}>
        <GenericEditor<TagFields>
          size="small"
          fields={tagsEditableFields.filter((field) => field.name !== 'id')}
          onFieldsChanged={onChange}
        />
      </div>
    ),
    hint: 'Suggested metadata for the tag',
  },
  // TODO: fields
  {
    name: 'comments',
    label: 'Comments',
    type: fieldTypes.textMarkdown,
  },
]

export default editableFields
