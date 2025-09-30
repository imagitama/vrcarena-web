import { CustomEditableField } from '@/editable-fields'
import React from 'react'

export default ({
  editableField,
  onChange,
  value,
  databaseResult,
  formFields,
}: {
  editableField: CustomEditableField<any, any>
  value: any
  onChange: (newVal: any) => void
  databaseResult: any
  formFields: any
}) => (
  <editableField.renderer
    onChange={(newValue) => onChange(newValue)}
    value={value}
    databaseResult={databaseResult}
    formFields={formFields}
  />
)
