import React from 'react'
import { GenericEditorForm } from '../../'

export default ({ onChange, fieldProperties }) => {
  return <GenericEditorForm fields={fieldProperties.fields} onSave={onChange} />
}
