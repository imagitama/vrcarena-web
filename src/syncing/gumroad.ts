import { FullAsset } from '../modules/assets'
import { SyncFieldTypes, SyncPlatformName, SyncPlatformInfo } from './'

const gumroad: SyncPlatformInfo<FullAsset> = {
  platformName: SyncPlatformName.Gumroad,
  fields: [
    {
      ourName: 'thumbnailurl',
      type: SyncFieldTypes.ThumbnailFromUrls,
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
    //   ourName: 'category',
    //   type: SyncFieldTypes.Constant, // function will do this for us
    //   label: 'Category',
    // },
    // {
    //   ourName: 'author', // author ID
    //   type: SyncFieldTypes.RecordId,
    //   typeInfo: {
    //     table: 'assets',
    //   },
    //   label: 'Author',
    // },
  ],
}

export default gumroad
