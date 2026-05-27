import { EditableField } from '@/editable-fields'
import { fieldTypes } from '@/generic-forms'

const FieldOutput = ({
  children,
  editableField,
}: {
  children: any
  editableField?: EditableField<any>
}) => {
  if (Array.isArray(children)) {
    return children.map((val, i) => (
      <>
        {i !== 0 ? <br /> : null}
        <FieldOutput children={val} />
      </>
    ))
  }

  if (typeof children === 'string') {
    if (editableField && editableField.type === fieldTypes.imageUpload) {
      return <img src={children} width="200" />
    }

    return children
  }

  if (typeof children === 'boolean') {
    if (children === true) {
      return 'Yes'
    } else {
      return 'No'
    }
  }

  if (children === null) {
    return '(nothing)'
  }

  return children.toString()
}

export default FieldOutput
