import React from 'react'
import { CollectionNames } from '../../data-store'
import { handleError } from '../../error-handling'
import { PublishStatuses } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import EditorRecordManager from '../editor-record-manager'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import { FullAmendment } from '../../modules/amendments'
import { getIsStringADate } from '../../utils'

// dates inside of diffs are stored as strings so we need to convert them to Date for storage
const mapRawFieldsToSavableFields = (fields: {
  [key: string]: any
}): { [key: string]: any } => {
  const savableFields: { [key: string]: any } = {}

  for (const fieldName in fields) {
    let field = fields[fieldName]

    if (getIsStringADate(field)) {
      field = new Date(field)
    }

    savableFields[fieldName] = field
  }

  return savableFields
}

export default ({
  amendment,
  onDone
}: {
  amendment: FullAmendment
  onDone: () => void
}) => {
  const [
    isSavingParent,
    isSavingParentSuccess,
    isSavingParentError,
    saveParent
  ] = useDatabaseSave(amendment.parenttable, amendment.parent)

  const beforeApprove = async () => {
    try {
      // const fieldsToSave = mapRawFieldsToSavableFields(amendment.fields)
      const fieldsToSave = amendment.fields

      // console.debug(`Saving parent`, amendment.fields, fieldsToSave)

      await saveParent({
        ...fieldsToSave
      })

      return true
    } catch (err) {
      console.error('Failed to approve amendment', err)
      handleError(err)
    }
  }

  return (
    <>
      {isSavingParent ? (
        <LoadingIndicator message="Applying..." />
      ) : isSavingParentError ? (
        <ErrorMessage>Failed to apply to parent!</ErrorMessage>
      ) : isSavingParentSuccess ? (
        <SuccessMessage>Parent has been updated successfully</SuccessMessage>
      ) : null}
      <EditorRecordManager
        id={amendment.id}
        metaCollectionName={CollectionNames.AmendmentsMeta}
        showPublishButtons={false}
        showAccessButtons={false}
        showEditorNotes
        allowDeclineOptions
        existingApprovalStatus={amendment.approvalstatus}
        // needed otherwise approve button complains
        existingPublishStatus={PublishStatuses.Published}
        // @ts-ignore
        onDone={onDone}
        // @ts-ignore
        beforeApprove={beforeApprove}
      />
    </>
  )
}
