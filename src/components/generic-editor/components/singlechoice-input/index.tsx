import React from 'react'
import CheckboxInput from '@/components/checkbox-input'
import { SelectEditableField } from '@/editable-fields'
import HintText from '@/components/hint-text'

export default ({
  editableField,
  onChange,
  value = null,
}: {
  editableField: SelectEditableField<any>
  value: string | null
  onChange: (newVal: string | null) => void
}) => (
  <>
    {(editableField.options || []).map(
      ({ value: optionValue, label, subLabel }) => {
        const isChecked = value === optionValue
        return (
          <CheckboxInput
            key={optionValue}
            label={
              <>
                {label}
                {subLabel && (
                  <HintText small style={{ marginLeft: '0.5rem' }}>
                    {subLabel}
                  </HintText>
                )}
              </>
            }
            onChange={() => onChange(optionValue)}
            value={isChecked}
          />
        )
      }
    )}
  </>
)
