import { fieldTypes } from '../generic-forms'
import {
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  BANNER_WIDTH,
  BANNER_HEIGHT,
  PROMO_WIDTH,
} from '../config'
import categoryMeta from '../category-meta'
import { bucketNames } from '../file-uploading'
import { EditableField } from './'
import { CollectionNames, Event } from '../modules/events'
import { getFriendlyDate } from '../utils/dates'
import { Author } from '../modules/authors'

enum SectionNames {
  Basic = 'Basic',
  Promo = 'Promo',
  Social = 'Social',
  Commissions = 'Commissions',
  Sales = 'Sales',
}

const fields: EditableField<Author>[] = [
  {
    name: 'name',
    label: 'Name',
    type: fieldTypes.text,
    isRequired: true,
    section: SectionNames.Basic,
    hint: 'The full name of the author. Usually their store page like Gumroad username. If more than one person but together you made something combine your names together.',
  },
  {
    name: 'categories',
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
    name: 'description',
    label: 'Description',
    type: fieldTypes.textMarkdown,
    default: '',
    section: SectionNames.Basic,
    hint: 'Explain a little about the author.',
  },
  {
    name: 'avatarurl',
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
    name: 'bannerurl',
    label: 'Banner',
    type: fieldTypes.imageUpload,
    imageUploadProperties: {
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      bucketName: bucketNames.authorBanners,
    },
    default: '',
    section: SectionNames.Basic,
    hint: 'A short, wide image displayed at the top of the author page as a background image.',
  },
  {
    name: 'promourl',
    label: 'Promo Image',
    type: fieldTypes.imageUpload,
    imageUploadProperties: {
      width: PROMO_WIDTH,
      height: PROMO_WIDTH,
      bucketName: bucketNames.authorPromos,
    },
    default: '',
    section: SectionNames.Promo,
    hint: "Experimental. This image will be rendered inside the VRChat VRCArena world with buttons to clone the author's avatars. Updated every 30 minutes.",
  },
  {
    name: 'websiteurl',
    label: 'Website URL',
    type: fieldTypes.text,
    default: '',
    section: SectionNames.Basic,
  },
  {
    name: 'email',
    label: 'Email',
    type: fieldTypes.text,
    default: '',
    hint: 'Warning: Bots can find this URL so your spam inbox might get spammed!',
    section: SectionNames.Basic,
  },
  {
    name: 'twitterusername',
    label: 'Twitter Username (without @)',
    type: fieldTypes.text,
    default: '',
    section: SectionNames.Social,
  },
  {
    name: 'gumroadusername',
    label: 'Gumroad Username',
    type: fieldTypes.text,
    default: '',
    hint: 'eg. Tosca is "xtosca" which is from their profile URL https://gumroad.com/xtosca',
    section: SectionNames.Social,
  },
  {
    name: 'discordusername',
    label: 'Discord Username',
    type: fieldTypes.text,
    default: '',
    hint: 'Their personal Discord username. Usually contains a hash and 4 digits ie PeanutBuddha#1234',
    section: SectionNames.Social,
  },
  {
    name: 'discordserverinviteurl',
    label: 'Discord Server Invite URL',
    type: fieldTypes.text,
    default: '',
    hint: 'A URL people can visit to join the Discord server. eg. https://discord.gg/gpD7fq Is hidden if server ID is provided',
    section: SectionNames.Social,
  },
  {
    name: 'discordserverid',
    label: 'Discord Server ID',
    type: fieldTypes.text,
    default: '',
    hint: 'Enable widgets for the server and copy the server ID so that a nice looking server overview can be displayed.',
    section: SectionNames.Social,
  },
  {
    name: 'patreonusername',
    label: 'Patreon username',
    type: fieldTypes.text,
    default: '',
    hint: 'The name in the URL like https://patreon.com/[username]',
    section: SectionNames.Social,
  },
  {
    name: 'boothusername',
    label: 'Booth username',
    type: fieldTypes.text,
    default: '',
    hint: 'The name in the URL like https://[username].booth.pm',
    section: SectionNames.Social,
  },
  // commissions
  {
    name: 'isopenforcommission',
    label: 'Open for commissions',
    type: fieldTypes.checkbox,
    default: false,
    hint: 'Shows a message for the author page that they are open for commissions with optional text.',
    section: SectionNames.Commissions,
  },
  {
    name: 'showcommissionstatusforassets',
    label: 'Show in assets',
    type: fieldTypes.checkbox,
    default: true,
    hint: 'Show a message at the top of each asset they have authored that they are open or closed for commissions.',
    section: SectionNames.Commissions,
  },
  {
    name: 'commissioninfo',
    label: 'Commission info',
    type: fieldTypes.textMarkdown,
    default: '',
    hint: 'Explain what they offer, their prices, links to work they have done. You can use Markdown so you can embed images and links.',
    section: SectionNames.Commissions,
  },
  // sales
  {
    name: 'salereason',
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
    name: 'saledescription',
    label: 'Sale description/info',
    type: fieldTypes.textMarkdown,
    default: '',
    hint: 'Explain what the sale is for, what assets are on sale, what booth you have at the event, etc.',
    section: SectionNames.Sales,
  },
  {
    name: 'saleexpiresat',
    label: 'Sale expiry',
    type: fieldTypes.date,
    default: null,
    hint: 'When does the sale expire? We will hide all sale info after this',
    section: SectionNames.Sales,
  },
]

export default fields
