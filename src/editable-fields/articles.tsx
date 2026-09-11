import { Article, CollectionNames } from '@/modules/articles'
import { EditableField } from '.'
import { fieldTypes } from '@/generic-forms'
import AttachmentsForm from '@/components/attachments-form'
import { AttachmentReason } from '@/modules/attachments'

const editableFields: EditableField<Article>[] = [
  {
    name: 'title',
    label: 'Title',
    type: fieldTypes.text,
    hint: "A short title to attract the user's attention.",
    isRequired: true,
  },
  {
    name: 'content',
    label: 'Content',
    type: fieldTypes.textMarkdown,
    hint: 'The body of the article.',
    isRequired: true,
  },
  {
    name: 'tags',
    label: 'Tags',
    type: fieldTypes.tags,
    showRecommendedTags: false,
    showSuggestButton: false,
    suggestedTags: ['site', 'vrchat', 'resonite', 'hardware', 'steamvr'],
    hint: "Some tags shown below the article content to help the user know what it's related to.",
    isRequired: true,
  },
  {
    name: 'attachmentids',
    label: 'Attachments',
    type: fieldTypes.custom,
    default: [],
    renderer: ({ value, onChange, formFields }) => (
      <AttachmentsForm
        parentTable={CollectionNames.Articles}
        parentId={formFields.id}
        reason={AttachmentReason.AssetFile}
        ids={value || []}
        onChange={(newAttachmentIds) => onChange(newAttachmentIds)}
      />
    ),
    hint: 'Images and YouTube videos related to the content.',
  },
  {
    name: 'parenttable',
    type: fieldTypes.hidden,
  },
  {
    name: 'parentid',
    type: fieldTypes.hidden,
  },
]

export default editableFields
