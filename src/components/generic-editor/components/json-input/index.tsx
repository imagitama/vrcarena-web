import { JsonEditableField } from '@/editable-fields'
import GenericEditor from '../..'
import { GenericInputProps } from '../../types'

interface JsonValue extends Record<string, any> {}

const JsonInput = ({
  editableField,
  value,
  onChange,
  formFields,
}: GenericInputProps<JsonValue, any, JsonEditableField<any>>) => {
  console.debug(`JsonInput`, { formFields })
  return (
    <GenericEditor
      fields={editableField.json}
      overrideFields={value}
      onFieldsChanged={(newVal) => onChange(newVal)}
      showControls={false}
    />
  )
}

export default JsonInput
