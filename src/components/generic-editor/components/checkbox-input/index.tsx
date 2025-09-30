import React from 'react'
import type { GenericInputProps } from '../../'
import Button from '../../../button'
import { CheckboxEditableField } from '@/editable-fields'
import CheckboxInput from '@/components/checkbox-input'

export default ({
  editableField,
  onChange,
  value,
}: GenericInputProps & CheckboxEditableField<any, any>) => (
  <>
    <CheckboxInput
      onChange={() => onChange(!value)}
      value={value}
      label={
        (editableField as CheckboxEditableField<any, any>).checkboxLabel ||
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
