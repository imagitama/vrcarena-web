import React from 'react'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import type { GenericInputProps } from '../../'
import Button from '../../../button'

export default ({ onChange, label, value, allowEmpty }: GenericInputProps) => (
  <>
    <FormControlLabel
      label={label}
      control={<Checkbox onChange={() => onChange(!value)} checked={value} />}
    />
    {allowEmpty === true ? (
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
