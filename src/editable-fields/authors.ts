import { AuthorFieldNames } from '../hooks/useDatabaseQuery'
import { fieldTypes } from '../generic-forms'
import {
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  BANNER_WIDTH,
  BANNER_HEIGHT,
} from '../config'
import categoryMeta from '../category-meta'
import { bucketNames } from '../file-uploading'
import { EditableField } from './'
import { CollectionNames, Event } from '../modules/events'
import { getFriendlyDate } from '../utils/dates'

enum SectionNames {
  Basic = 'Basic',
  Social = 'Social',
  Commissions = 'Commissions',
  Sales = 'Sales',
}

const fields: EditableField<any>[] = [
  {
    name: AuthorFieldNames.name,
    label: 'Name',
    type: fieldTypes.text,
    isRequired: true,
    section: SectionNames.Basic,
    hint: 'The full name of the author. Usually their store page like Gumroad username. If more than one person but together you made something combine your names together.',
  },
  {
    name: AuthorFieldNames.categories,
    label: 'Categories',
    type: fieldTypes.multichoice,
    options: Object.entries(categoryMeta).map(([name, categoryInfo]) => ({
      value: name,
      label: categoryInfo.name,
    })),
    default: [],
    section: SectionNames.Basic,
    hint: 'Help people find authors related to categories they are interested in.',
  },
  {
    name: AuthorFieldNames.description,
    label: 'Description',
    type: fieldTypes.textMarkdown,
    default: '',
    section: SectionNames.Basic,
    hint: 'Explain a little about the author.',
  },
  {
    name: AuthorFieldNames.avatarUrl,
    label: 'Avatar',
    type: fieldTypes.imageUpload,
    imageUploadProperties: {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      bucketName: bucketNames.authorAvatars,
    },
    default: '',
    section: SectionNames.Basic,
  },
  {
    name: AuthorFieldNames.bannerUrl,
    label: 'Banner',
    type: fieldTypes.imageUpload,
    imageUploadProperties: {
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      bucketName: bucketNames.authorBanners,
    },
    default: '',
    section: SectionNames.Basic,
  },
  {
    name: AuthorFieldNames.websiteUrl,
    label: 'Website URL',
    type: fieldTypes.text,
    default: '',
    section: SectionNames.Basic,
  },
  {
    name: AuthorFieldNames.email,
    label: 'Email',
    type: fieldTypes.text,
    default: '',
    hint: 'Warning: Bots can find this URL so your spam inbox might get spammed!',
    section: SectionNames.Basic,
  },
  {
    name: AuthorFieldNames.twitterUsername,
    label: 'Twitter Username (without @)',
    type: fieldTypes.text,
    default: '',
    section: SectionNames.Social,
  },
  {
    name: AuthorFieldNames.gumroadUsername,
    label: 'Gumroad Username',
    type: fieldTypes.text,
    default: '',
    hint: 'eg. Tosca is "xtosca" which is from their profile URL https://gumroad.com/xtosca',
    section: SectionNames.Social,
  },
  {
    name: AuthorFieldNames.discordUsername,
    label: 'Discord Username',
    type: fieldTypes.text,
    default: '',
    hint: 'Their personal Discord username. Usually contains a hash and 4 digits ie PeanutBuddha#1234',
    section: SectionNames.Social,
  },
  {
    name: AuthorFieldNames.discordServerInviteUrl,
    label: 'Discord Server Invite URL',
    type: fieldTypes.text,
    default: '',
    hint: 'A URL people can visit to join the Discord server. eg. https://discord.gg/gpD7fq Is hidden if server ID is provided',
    section: SectionNames.Social,
  },
  {
    name: AuthorFieldNames.discordServerId,
    label: 'Discord Server ID',
    type: fieldTypes.text,
    default: '',
    hint: 'Enable widgets for the server and copy the server ID so that a nice looking server overview can be displayed.',
    section: SectionNames.Social,
  },
  {
    name: AuthorFieldNames.patreonUsername,
    label: 'Patreon username',
    type: fieldTypes.text,
    default: '',
    hint: 'The name in the URL like https://patreon.com/[username]',
    section: SectionNames.Social,
  },
  {
    name: AuthorFieldNames.boothUsername,
    label: 'Booth username',
    type: fieldTypes.text,
    default: '',
    hint: 'The name in the URL like https://[username].booth.pm',
    section: SectionNames.Social,
  },
  // commissions
  {
    name: AuthorFieldNames.isOpenForCommission,
    label: 'Open for commissions',
    type: fieldTypes.checkbox,
    default: false,
    hint: 'Shows a message for the author page that they are open for commissions with optional text.',
    section: SectionNames.Commissions,
  },
  {
    name: AuthorFieldNames.showCommissionStatusForAssets,
    label: 'Show in assets',
    type: fieldTypes.checkbox,
    default: true,
    hint: 'Show a message at the top of each asset they have authored that they are open or closed for commissions.',
    section: SectionNames.Commissions,
  },
  {
    name: AuthorFieldNames.commissionInfo,
    label: 'Commission info',
    type: fieldTypes.textMarkdown,
    default: '',
    hint: 'Explain what they offer, their prices, links to work they have done. You can use Markdown so you can embed images and links.',
    section: SectionNames.Commissions,
  },
  // sales
  {
    name: AuthorFieldNames.saleReason,
    label: 'Sale reason',
    type: fieldTypes.item,
    default: null,
    itemProperties: {
      collectionName: CollectionNames.Events,
      getLabel: (event: Event) =>
        `${event.name} (${getFriendlyDate(event.startsat, false)})`,
    },
    hint: 'You must select an event for your sale to appear. If your event is not listed here please contact us to have it show up.',
    section: SectionNames.Sales,
  },
  {
    name: AuthorFieldNames.saleDescription,
    label: 'Sale description/info',
    type: fieldTypes.textMarkdown,
    default: '',
    hint: 'Explain what the sale is for, what assets are on sale, what booth you have at the event, etc.',
    section: SectionNames.Sales,
  },
  {
    name: AuthorFieldNames.saleExpiresAt,
    label: 'Sale expiry',
    type: fieldTypes.date,
    default: null,
    hint: 'When does the sale expire? We will hide all sale info after this',
    section: SectionNames.Sales,
  },
]

export default fields
