import { FullAsset } from '../modules/assets'
import { SyncFieldTypes, SyncPlatformName, SyncPlatformInfo } from './'

const gumroad: SyncPlatformInfo<FullAsset> = {
  platformName: SyncPlatformName.Itch,
  fields: [
    {
      // NOTE: URL is base64 encoded to avoid CORS error
      ourName: 'thumbnailurl',
      type: SyncFieldTypes.ImageUrl,
      label: 'Thumbnail',
    },
    {
      ourName: 'title',
      type: SyncFieldTypes.Text,
      label: 'Title',
    },
    {
      ourName: 'description',
      type: SyncFieldTypes.Markdown,
      label: 'Description',
    },
    {
      ourName: 'attachmentids',
      type: SyncFieldTypes.Attachments,
      label: 'Attachments',
    },
    {
      ourName: 'attachmentsdata',
      type: SyncFieldTypes.Ignored,
    },
    // {
    //   ourName: 'author', // author ID
    //   type: SyncFieldTypes.RecordId,
    //   typeInfo: {
    //     table: 'authors',
    //   },
    //   label: 'Author',
    // },
  ],
}

export default gumroad
