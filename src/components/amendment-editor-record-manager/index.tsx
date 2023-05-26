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
      const fieldsToSave = amendment.fields

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
        showEditButtons={false}
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
