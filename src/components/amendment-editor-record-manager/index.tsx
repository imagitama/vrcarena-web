import React from 'react'
import { handleError } from '../../error-handling'
import { PublishStatus } from '../../modules/common'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import EditorRecordManager from '../editor-record-manager'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import { FullAmendment, CollectionNames } from '../../modules/amendments'

const AmendmentEditorRecordManager = ({
  amendment,
  onDone,
}: {
  amendment: FullAmendment
  onDone: () => void
}) => {
  const [isSavingParent, isSavingParentSuccess, lastErrorCode, saveParent] =
    useDataStoreEdit(amendment.parenttable, amendment.parent)

  const beforeApprove = async (): Promise<boolean> => {
    try {
      const fieldsToSave = amendment.fields

      await saveParent({
        ...fieldsToSave,
      })

      return true
    } catch (err) {
      console.error('Failed to approve amendment', err)
      handleError(err)
      return false
    }
  }

  return (
    <>
      {isSavingParent ? (
        <LoadingIndicator message="Applying..." />
      ) : lastErrorCode !== null ? (
        <ErrorMessage>
          Failed to apply to parent (code {lastErrorCode}
        </ErrorMessage>
      ) : isSavingParentSuccess ? (
        <SuccessMessage>Parent has been updated successfully</SuccessMessage>
      ) : null}
      <EditorRecordManager
        id={amendment.id}
        metaCollectionName={CollectionNames.AmendmentsMeta}
        showPublishButtons={false}
        showAccessButtons={false}
        showEditorNotes
        existingApprovalStatus={amendment.approvalstatus}
        existingPublishStatus={PublishStatus.Published}
        onDone={onDone}
        beforeApprove={beforeApprove}
      />
    </>
  )
}

export default AmendmentEditorRecordManager
