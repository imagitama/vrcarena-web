import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import { EditableField } from '@/editable-fields'
import { fieldTypes } from '@/generic-forms'
import { getIsUrlAnImage } from '@/utils'

const FieldOutput = ({
  children,
  editableField,
}: {
  children: any
  editableField?: EditableField<any>
}) => {
  if (Array.isArray(children)) {
    if (children.length === 0) {
      return '(no items)'
    }

    return children.map((val, i) => (
      <>
        {i !== 0 ? <br /> : null}
        <FieldOutput children={val} />
      </>
    ))
  }

  if (typeof children === 'string') {
    if (
      (editableField && editableField.type === fieldTypes.imageUpload) ||
      getIsUrlAnImage(children)
    ) {
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

  if (children === undefined) {
    return '(no value)'
  }

  if (typeof children === 'object') {
    if (React.isValidElement(children)) {
      return React.cloneElement(children)
    }

    return (
      <Table size="small">
        <TableBody>
          {Object.entries(children).map(([key, val]) => (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>
                <FieldOutput>{val}</FieldOutput>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return children.toString()
}

export default FieldOutput
