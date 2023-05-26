import { CommonMetaFieldNames } from '../data-store'

export const mergeNewFieldsIntoParent = (newFields, parent) => {
  const newParent = { ...parent }
  delete newParent.id
  delete newParent[CommonMetaFieldNames.createdAt]
  delete newParent[CommonMetaFieldNames.createdBy]
  delete newParent[CommonMetaFieldNames.lastModifiedAt]
  delete newParent[CommonMetaFieldNames.lastModifiedBy]
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

  return newParent
}

export const getChangedFieldNames = (oldFields, newFields) => {
  const changedFieldNames = []

  for (const fieldName in newFields) {
    if (fieldName === 'id') {
      continue
    }

    if (newFields[fieldName] !== oldFields[fieldName]) {
      changedFieldNames.push(fieldName)
    }
  }

  return changedFieldNames
}
