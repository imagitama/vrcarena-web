import React from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
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
          <Button onClick={() => onChange(null)} color="default" size="small">
            Clear
          </Button>
        </div>
      )
    ) : null}
  </>
)
