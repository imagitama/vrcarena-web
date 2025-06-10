import React from 'react'
import { makeStyles } from '@mui/styles'
import { SyncFieldBase } from '../../../../syncing'
import useSync from '../../hooks/useSync'
import Paper from '../../../paper'
import CheckboxInput from '../../../checkbox-input'
import FieldInput from '../form-field-input'
import Block from '../../../block'

const useStyles = makeStyles({
  field: {
    marginBottom: '0.5rem',
  },
  disabledFieldInputWrapper: {
    opacity: 0.5,
  },
})

const FormField = <TRecord extends object>({
  fieldMeta,
}: {
  fieldMeta: SyncFieldBase<TRecord>
}) => {
  const { lastResult, fields, setField, disabledFieldNames, toggleField } =
    useSync<TRecord>()
  const classes = useStyles()

  const fieldResult = lastResult.fields.find(
    (fieldResult) => fieldResult.ourName === fieldMeta.ourName
  )

  // this can happen if the sync fails for a specific field (it won't be returned at all)
  if (!fieldResult) {
    return null
  }

  if (!(fieldMeta.ourName in fields)) {
    return <div>Waiting for value ({fieldMeta.ourName.toString()})</div>
  }

  // @ts-ignore
  const value = fields[fieldMeta.ourName]

  const isDisabled = disabledFieldNames.includes(fieldMeta.ourName as string)

  return (
    <Block title={fieldMeta.label}>
      <div>
        <CheckboxInput
          value={!isDisabled}
          onChange={() => toggleField(fieldMeta.ourName as string)}
          label="Overwrite with this field"
        />
      </div>
      <div className={`${isDisabled ? classes.disabledFieldInputWrapper : ''}`}>
        <FieldInput
          fieldMeta={fieldMeta}
          value={value}
          fieldResult={fieldResult}
          onChange={(newValue) =>
            setField(fieldResult.ourName as string, newValue)
          }
          isDisabled={isDisabled}
        />
      </div>
    </Block>
  )
}

export default FormField
