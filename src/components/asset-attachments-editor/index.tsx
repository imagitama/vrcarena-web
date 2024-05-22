import React from 'react'
import { Attachment, AttachmentReason } from '../../modules/attachments'
import { Asset, CollectionNames } from '../../modules/assets'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { trackAction } from '../../analytics'
import { handleError } from '../../error-handling'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import AttachmentsForm from '../attachments-form'

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
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave<Asset>(
    CollectionNames.Assets,
    assetId
  )

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
    <AttachmentsForm
      reason={AttachmentReason.AssetFile}
      parentTable={CollectionNames.Assets}
      parentId={assetId}
      ids={ids}
      attachmentsData={attachmentsData}
      onDone={onSave}
    />
  )
}

export default AssetAttachmentsEditor
