import { fieldTypes } from '../generic-forms'
import { EditableField } from './'
import {
  Attachment,
  AttachmentReason,
  AttachmentType,
} from '../modules/attachments'
import { bucketNames } from '../file-uploading'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '../config'

const fields: EditableField<Attachment>[] = [
  // probably should not be able to edit this afterwards
  // {
  //   name: 'reason',
  //   label: 'Reason',
  //   type: fieldTypes.singlechoice,
  //   options: Object.entries(AttachmentReason).map(([reason, val]) => ({
  //     label: reason,
  //     value: val,
  //   })),
  //   hint: 'Why this attachment exists. Asset files and user added should have a parent set.',
  // },
  // {
  //   name: 'type',
  //   label: 'Type',
  //   type: fieldTypes.singlechoice,
  //   options: Object.entries(AttachmentType).map(([type, val]) => ({
  //     label: type,
  //     value: val,
  //   })),
  // },
  {
    name: 'title',
    label: 'Title',
    type: fieldTypes.text,
  },
  {
    name: 'description',
    label: 'Description',
    type: fieldTypes.textMarkdown,
  },
  {
    name: 'thumbnailurl',
    label: 'Thumbnail',
    type: fieldTypes.imageUpload,
    imageUploadProperties: {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      bucketName: bucketNames.attachmentThumbnails,
    },
  },
  {
    name: 'isadult',
    label: 'Is adult',
    type: fieldTypes.checkbox,
    // TODO: only allow empty if has a parent (so it inherits)
    // allowEmpty: true,
    // default: null,
  },
  {
    name: 'tags',
    label: 'Tags',
    type: fieldTypes.tags,
  },
]

export default fields
