import React from 'react'
import {
  Attachment,
  AttachmentReason,
  FullAttachment,
  ViewNames,
} from '../../modules/attachments'
import { Asset, CollectionNames } from '../../modules/assets'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { trackAction } from '../../analytics'
import { handleError } from '../../error-handling'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import AttachmentsForm from '../attachments-form'
import WarningMessage from '../warning-message'
import useDataStoreItems from '../../hooks/useDataStoreItems'

const AssetAttachmentsEditor = ({
  assetId,
  ids,
  attachmentsData,
  overrideSave,
  onDone,
  actionCategory,
}: {
  assetId: string
  ids: string[]
  attachmentsData: Attachment[]
  overrideSave?: (
    newIds: string[],
    extraFields: { attachmentsdata: Attachment[] }
  ) => void
  onDone?: () => void
  actionCategory?: string
}) => {
  // const needsToPopulateAttachments =
  //   ids.length > 0 &&
  //   ids.filter(
  //     (id) => attachmentsData.find((data) => data.id === id) !== undefined
  //   ).length > 0

  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave<Asset>(
    CollectionNames.Assets,
    assetId
  )
  // const [isLoading, isError, newAttachmentsData] =
  //   useDataStoreItems<FullAttachment>(
  //     ViewNames.GetFullAttachments,
  //     needsToPopulateAttachments ? ids : false
  //   )

  // const attachmentsDataToUse = newAttachmentsData || attachmentsData

  const onSave = async (newIds: string[], newDatas: Attachment[]) => {
    try {
      console.debug(`AssetAttachmentsEditor.onSave`, { newIds })

      if (overrideSave) {
        overrideSave(newIds, { attachmentsdata: newDatas })

        if (onDone) {
          onDone()
        }
        return
      }

      trackAction(actionCategory, 'Click save asset attachment editor button', {
        assetId,
        newIds,
      })

      await save({
        attachmentids: newIds,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset', err)
      handleError(err)
    }
  }

  // if (needsToPopulateAttachments && (isLoading || !newAttachmentsData)) {
  //   return <LoadingIndicator message="Loading attachments for editor..." />
  // }

  // if (isError) {
  //   return <ErrorMessage>Failed to load attachments</ErrorMessage>
  // }

  if (isSaving) {
    return <LoadingIndicator message="Saving asset..." />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save</ErrorMessage>
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Saved!</SuccessMessage>
  }

  return (
    <>
      <AttachmentsForm
        reason={AttachmentReason.AssetFile}
        parentTable={CollectionNames.Assets}
        parentId={assetId}
        ids={ids}
        attachmentsData={attachmentsData}
        onDone={onSave}
      />
    </>
  )
}

export default AssetAttachmentsEditor
