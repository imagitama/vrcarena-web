import { TagSuggestion, TagSuggestionType } from '@/modules/tagsuggestions'
import { EditableField } from './'
import { fieldTypes } from '@/generic-forms'
import { capitalize } from '@/utils'

const editableFields: EditableField<TagSuggestion>[] = [
  {
    name: 'targettag',
    label: 'Tag',
    type: fieldTypes.text,
    hint: 'The tag you are suggesting about (leave blank for create)',
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
    label: 'Related Tag',
    type: fieldTypes.text,
    hint: 'Another tag which is related to your suggestion eg. if you think the target tag should be replaced with another',
  },
  // TODO: fields
  {
    name: 'comments',
    label: 'Comments',
    type: fieldTypes.textMarkdown,
  },
]

export default editableFields
