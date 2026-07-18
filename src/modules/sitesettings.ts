import { EditableField } from '@/editable-fields'
import { fieldTypes } from '@/generic-forms'

export interface SiteSettings<T> extends Record<string, any> {
  id: string
  value: T
  lastmodifiednotes: string | null
  lastmodifiedat: string | null // date
  lastmodifiedby: string | null
}

export interface AutoApprovalSettings {
  enabled: boolean
  repneeded: number
  hoursneeded: number
  aiscoreneeded: number
}

export enum SiteSettingsId {
  AssetAutoApproval = 'assetautoapproval',
  AmendmentAutoApproval = 'amendmentautoapproval',
}

export enum CollectionNames {
  SiteSettings = 'sitesettings',
}

export const assetAutoApprovalEditableFields: EditableField<
  SiteSettings<AutoApprovalSettings>
>[] = [
  {
    name: 'value',
    type: fieldTypes.json,
    label: 'Asset Auto-Approval',
    json: [
      {
        name: 'enabled',
        type: fieldTypes.checkbox,
        label: 'Enabled',
        hint: 'If disabled, nothing will be automatically approved and you must manually do it.',
      },
      {
        name: 'repneeded',
        type: fieldTypes.int,
        label: 'Rep',
        hint: 'The amount of reputation the publisher needs. Set to 0 to skip.',
      },
      {
        name: 'hoursneeded',
        type: fieldTypes.float,
        label: 'Hours',
        hint: 'The number of hours it needs to be published for. Set to 0 to skip.',
      },
      {
        name: 'aiscoreneeded',
        type: fieldTypes.float,
        label: 'AI Score',
        hint: 'The AI score it needs (where 0.6 is 60%). If the AI fails it will not be approved. Set to 0 to skip.',
      },
    ],
  },
  {
    name: 'lastmodifiednotes',
    type: fieldTypes.text,
    multiline: true,
    label: 'Change Notes',
    hint: 'An explanation of why you made the changes',
    overrideValue: '',
  },
]

export const amendmentAutoApprovalEditableFields: EditableField<
  SiteSettings<AutoApprovalSettings>
>[] = [
  {
    name: 'value',
    type: fieldTypes.json,
    label: 'Amendment Auto-Approval',
    json: [
      {
        name: 'enabled',
        type: fieldTypes.checkbox,
        label: 'Enabled',
        hint: 'If disabled, nothing will be automatically approved and you must manually do it.',
      },
      {
        name: 'repneeded',
        type: fieldTypes.int,
        label: 'Rep',
        hint: 'The amount of reputation the publisher needs. Set to 0 to skip.',
      },
      {
        name: 'hoursneeded',
        type: fieldTypes.float,
        label: 'Hours',
        hint: 'The number of hours it needs to be published for. Set to 0 to skip.',
      },
      // {
      //   name: 'aiscoreneeded',
      //   type: fieldTypes.float,
      //   label: 'AI Score',
      //   hint: 'The AI score it needs (where 0.6 is 60%). If the AI fails it will not be approved. Set to 0 to skip.',
      // },
    ],
  },
  {
    name: 'lastmodifiednotes',
    type: fieldTypes.text,
    multiline: true,
    label: 'Change Notes',
    hint: 'An explanation of why you made the changes',
    overrideValue: '',
  },
]
