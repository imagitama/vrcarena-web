import { CustomEditableField } from '@/editable-fields'
import React from 'react'
import { GenericInputProps } from '../../types'

export default (
  props: GenericInputProps<any, any, CustomEditableField<any, any>>
) => <props.editableField.renderer {...props} />
