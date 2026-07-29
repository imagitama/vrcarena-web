import React from 'react'
import Button from '@/components/button'
import { CheckboxEditableField } from '@/editable-fields'
import CheckboxInput from '@/components/checkbox-input'
import { GenericInputProps } from '../../types'

export default ({
  editableField,
  onChange,
  value,
}: GenericInputProps<any, any> & CheckboxEditableField<any>) => (
  <>
    <CheckboxInput
      onChange={() => onChange(!value)}
      value={value}
      label={
        (editableField as CheckboxEditableField<any>).checkboxLabel ||
        editableField.label
      }
    />
    {editableField.allowEmpty === true ? (
      value === undefined || value === null ? (
        'Value is empty (inherits)'
      ) : (
        <div>
          <Button onClick={() => onChange(null)} color="secondary" size="small">
            Clear
          </Button>
        </div>
      )
    ) : null}
  </>
)
