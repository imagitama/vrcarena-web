export const mergeNewFieldsIntoParent = (newFields: any, parent: any): any => {
  const newParent = { ...parent }
  delete newParent.id
  delete newParent.createdat
  delete newParent.createdby
  delete newParent.lastmodifiedat
  delete newParent.lastmodifiedby
  delete newParent.ts

  for (const fieldName in parent) {
    // note field value could be empty!
    if (fieldName in newFields) {
      newParent[fieldName] = newFields[fieldName]
    }
  }

  for (const fieldName in newFields) {
    if (!(fieldName in newParent)) {
      newParent[fieldName] = newFields[fieldName]
    }
  }

  // TODO: do this generically (quick fix)
  if (newFields.attachmentsdata && parent.attachmentsdata) {
    newParent.attachmentsdata = parent.attachmentsdata.concat(
      newFields.attachmentsdata
    )
  }

  return newParent
}

export const getChangedFieldNames = (oldFields: any, newFields: any): any => {
  const changedFieldNames = []

  for (const fieldName in newFields) {
    if (fieldName === 'id') {
      continue
    }

    // TODO: do this generically (quick fix)
    if (fieldName === 'attachmentsdata') {
      continue
    }

    if (newFields[fieldName] !== oldFields[fieldName]) {
      changedFieldNames.push(fieldName)
    }
  }

  return changedFieldNames
}
