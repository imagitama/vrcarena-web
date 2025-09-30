import React, { createContext, useContext, useState } from 'react'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import ItemsEditor from '../items-editor'
import {
  Attachment,
  AttachmentReason,
  CollectionNames,
  ViewNames,
} from '../../modules/attachments'
import AttachmentEditor from '../attachment-editor'
import AttachmentOutput from '../attachment'
import { trackAction } from '../../analytics'
import { handleError } from '../../error-handling'
import AttachmentMeta from '../attachment-meta'
import FormControls from '../form-controls'
import Button from '../button'
import useDataStoreItems from '@/hooks/useDataStoreItems'
import useMissingDataStoreItems from '@/hooks/useMissingDataStoreItems'

const useStyles = makeStyles({
  output: {
    overflow: 'hidden',
    '& img': {
      width: 'auto',
      maxHeight: '300px',
    },
  },
  item: {},
})

interface AttachmentFormContextValue {
  storeAttachmentsData: (attachmentData: Attachment) => void
}
const AttachmentFormContext = createContext<AttachmentFormContextValue>(
  undefined as any
)
const useAttachmentForm = () => useContext(AttachmentFormContext)

const Editor = ({
  item,
  reason,
  parentTable,
  parentId,
  onChange,
  onDone,
  attachmentsData,
}: {
  item: string | null
  onChange: (id: string) => void
  onDone: (id: string) => void
  // additional
  reason: AttachmentReason
  parentTable: string
  parentId: string
  attachmentsData: Attachment[]
}) => {
  const { storeAttachmentsData } = useAttachmentForm()

  const attachmentData = attachmentsData.find(
    (attachmentItem) => attachmentItem.id === item
  )

  return (
    <AttachmentEditor
      reason={reason}
      parentTable={parentTable}
      parentId={parentId}
      attachmentId={item || undefined}
      existingAttachment={attachmentData}
      onDone={(createdAttachment) => {
        console.debug(`AttachmentsForm.Editor.onDone`, {
          createdAttachment,
        })

        // after creating/editing a record we dont want to read it again
        // instead we can store whatever we sent off for future re-renders
        // NOTE: could mean stale data especially if two people edit at same time
        storeAttachmentsData(createdAttachment)

        onDone(createdAttachment.id)
      }}
    />
  )
}

const Renderer = ({
  item,
  attachmentsData,
}: {
  item: string | null
  attachmentsData: Attachment[]
}) => {
  const classes = useStyles()

  if (!item) {
    return <>Click the edit button to add attachment</>
  }

  const attachmentData = attachmentsData.find(
    (attachmentItem) => attachmentItem.id === item
  )

  if (!attachmentData) {
    return <>Attachment not found - are you sure it hasn't been deleted?</>
  }

  return (
    <div className={classes.output}>
      <AttachmentOutput attachment={attachmentData} />
      <br />
      <AttachmentMeta attachment={attachmentData} />
    </div>
  )
}

const isIdActuallyId = (thing: any): thing is string =>
  thing !== '' && thing !== null

const AttachmentsForm = ({
  reason,
  ids,
  parentTable,
  parentId,
  attachmentsData,
  onChange,
  onSave,
  actionCategory,
}: {
  reason: AttachmentReason
  ids: string[]
  parentTable: string
  parentId: string
  attachmentsData?: Attachment[]
  onChange?: (attachmentIds: string[], attachmentDatas: Attachment[]) => void
  onSave?: (attachmentIds: string[], attachmentDatas: Attachment[]) => void
  actionCategory?: string
}) => {
  const [newAttachmentIds, setNewAttachmentIds] =
    useState<(string | null)[]>(ids)
  const [newAttachmentsDatas, setNewAttachmentDatas] = useState<Attachment[]>(
    []
  )
  const [isLoading, lastErrorCode, attachments] =
    useMissingDataStoreItems<Attachment>(
      ViewNames.GetPublicAttachments,
      ids,
      attachmentsData || [],
      { queryName: 'attachments-form-ids' }
    )
  const classes = useStyles()

  const idsToUse = onChange ? ids : newAttachmentIds

  const onEditorChange = (newIds: string[]) => {
    if (onChange) {
      onChange(newIds, newAttachmentsDatas)
    } else {
      setNewAttachmentIds(newIds)
    }
  }

  const onClickSave = async () => {
    try {
      const newValue = newAttachmentIds.filter(isIdActuallyId)

      console.debug(`AttachmentsForm.onSave`, { newValue })

      if (actionCategory) {
        trackAction(actionCategory, 'Click save attachments form button')
      }

      onSave!(newValue, newAttachmentsDatas)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const allAttachmentDatas = (attachmentsData || [])
    .filter(
      (existingDataItem) =>
        !newAttachmentsDatas.find(
          (newItem) => newItem.id === existingDataItem.id
        )
    )
    .concat(newAttachmentsDatas)
    .concat(attachments || [])

  return (
    <AttachmentFormContext.Provider
      value={{
        storeAttachmentsData: (data) =>
          setNewAttachmentDatas((currentDatas) =>
            currentDatas
              .filter((existingItem) => existingItem.id !== data.id)
              .concat([data])
          ),
      }}>
      <ItemsEditor<
        string,
        {
          reason: AttachmentReason
          parentTable: string
          parentId: string
          attachmentsData: Attachment[]
        }
      >
        items={idsToUse as any} // TODO: fix up types
        onChange={(newIds) => onEditorChange(newIds)}
        editor={Editor}
        renderer={Renderer}
        commonProps={{
          reason,
          parentTable,
          parentId,
          attachmentsData: allAttachmentDatas,
        }}
        emptyItem={''}
        itemClassName={classes.item}
        nameSingular="attachment"
      />
      {onSave && (
        <FormControls>
          <Button icon={<SaveIcon />} onClick={onClickSave} size="large">
            Save Asset
          </Button>
        </FormControls>
      )}
    </AttachmentFormContext.Provider>
  )
}

export default AttachmentsForm
