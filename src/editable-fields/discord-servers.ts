import { fieldTypes } from '../generic-forms'
import { EditableField } from './'
import { DiscordServer } from '../modules/discordservers'

const fields: EditableField<DiscordServer>[] = [
  {
    name: 'name',
    label: 'Name',
    type: fieldTypes.text,
    isRequired: true,
    hint: 'The name of the server',
  },
  {
    name: 'description',
    label: 'Description',
    type: fieldTypes.textMarkdown,
    default: '',
    hint: 'A description of the server.',
  },
  {
    name: 'widgetid',
    label: 'Widget ID',
    default: '',
    type: fieldTypes.text,
    hint: 'Enable widgets and paste the server ID here so that we can display a widget for it.',
  },
  {
    name: 'iconurl',
    label: 'Icon URL',
    type: fieldTypes.text,
    default: '',
    hint: 'The URL to the icon of the server',
  },
  {
    name: 'inviteurl',
    label: 'Invite URL',
    default: '',
    type: fieldTypes.text,
    hint: 'The invite URL of the server. Remember to not make it expire!',
  },
  {
    name: 'requirespatreon',
    label: 'Requires Patreon?',
    default: false,
    type: fieldTypes.checkbox,
    hint: 'Do you need to be a Patreon sub to join this server?',
  },
  {
    name: 'patreonurl',
    label: 'Patreon URL',
    default: '',
    type: fieldTypes.text,
    hint: 'The URL to the Patreon you need to be a sub for to join it',
  },
]

export default fields
