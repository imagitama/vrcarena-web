import { EditableField } from '@/editable-fields'

export type GenericInputProps<
  TValue,
  TRecord extends Record<string, any>,
  TEditableField = EditableField<TRecord>
> = {
  editableField: TEditableField
  value: TValue
  onChange: (newVal: TValue) => void
  extraFormData: any
  setFieldsValues: (updates: Partial<TRecord>) => void
  databaseResult: false | TRecord | null
  formFields: TRecord
}

export type GenericInput<TValue, TRecord extends Record<string, any>> = (
  props: GenericInputProps<TValue, TRecord>
) => JSX.Element
