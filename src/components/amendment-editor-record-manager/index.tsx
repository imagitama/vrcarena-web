import React from 'react'
import { handleError } from '@/error-handling'
import { PublishStatus } from '@/modules/common'
import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import EditorRecordManager from '@/components/editor-record-manager'
import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import SuccessMessage from '@/components/success-message'
import { FullAmendment, CollectionNames } from '@/modules/amendments'

const AmendmentEditorRecordManager = ({
  amendment,
  onDone,
}: {
  amendment: FullAmendment<any>
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
        showStatuses
        showPublishButtons={false}
        showAccessButtons={false}
        showEditorNotes
        existingApprovalStatus={amendment.approvalstatus}
        existingPublishStatus={PublishStatus.Published} // amendments don't have this field
        onDone={onDone}
        beforeApprove={beforeApprove}
      />
    </>
  )
}

export default AmendmentEditorRecordManager
