export enum fieldTypes {
  text = 'text',
  textMarkdown = 'textMarkdown',
  multichoice = 'multichoice',
  checkbox = 'checkbox',
  date = 'date',
  ref = 'ref',
  imageUpload = 'imageUpload',
  hidden = 'hidden',
  searchable = 'searchable', // uses search with records with "id" property
  singlechoice = 'singlechoice',
  assets = 'assets',
  custom = 'custom',
  tags = 'tags',
  dropdown = 'dropdown',
  // for diffs
  url = 'url',
  email = 'email',
  item = 'item', // a single item eg. asset by ID
  price = 'price',
}

interface CommonEditorProps<TValue, TRecord = undefined> {
  associatedRecord?: TRecord
  overrideSave?: (newValue: TValue) => void
  onDone?: () => void
  onCancel?: () => void // conditionally renders cancel button
  actionCategory?: string
}

export interface ControlledEditorProps<TValue, TRecord = undefined>
  extends CommonEditorProps<TValue, TRecord> {
  value: TValue
  onChange: (newValue: TValue) => void
}

export interface UncontrolledEditorProps<TValue, TRecord = undefined>
  extends CommonEditorProps<TValue, TRecord> {
  initialValue?: TValue
}

/**
 * Props for a component that is used to edit something.
 * The cokmpo * The component must be:
 * - stateful and stateless
 * - assume you are logged in / have permission
 * - conditionally render a medium-sized centred save button if stateful
 **/
export type EditorProps<TValue, TRecord = undefined> =
  | ControlledEditorProps<TValue, TRecord>
  | UncontrolledEditorProps<TValue, TRecord>

type Distribute<T, U> = T extends unknown ? T & U : never

/**
 * Props for a component that is used to edit part of an asset.
 * The component must be:
 * - stateful and stateless
 * - assume you are logged in / have permission
 * - conditionally render a medium-sized centred save button if stateful
 */
export type AssetEditorProps<TValue, TRecord = undefined> = Distribute<
  EditorProps<TValue, TRecord>,
  { assetId: string | null }
>
