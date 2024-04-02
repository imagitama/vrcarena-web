import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AttachFileIcon from '@material-ui/icons/AttachFile'

import { SyncAttachment, SyncAttachmentType } from '../../../../syncing'
import ErrorMessage from '../../../error-message'
import LoadingIndicator from '../../../loading-indicator'
import SuccessMessage from '../../../success-message'
import {
  Attachment,
  AttachmentFields,
  AttachmentReason,
  AttachmentType,
  CollectionNames,
} from '../../../../modules/attachments'
import { insertRecord } from '../../../../data-store'
import { handleError } from '../../../../error-handling'
import Button from '../../../button'
import { isUrlAnImage } from '../../../../utils'
import FormControls from '../../../form-controls'
import CheckboxInput from '../../../checkbox-input'
import AttachmentOutput from '../../../attachment'
import useSync from '../../hooks/useSync'
import { downloadImageByUrl } from '../../../../images'
import { bucketNames } from '../../../../file-uploading'
import NoResultsMessage from '../../../no-results-message'
import AttachmentMeta from '../../../attachment-meta'
import WarningMessage from '../../../warning-message'

const useStyles = makeStyles({
  attachmentsSelector: {},
  attachments: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  attachment: {
    width: '25%',
    margin: '0 0.5rem 0.5rem 0',
  },
  attachmentOutput: {
    '&:hover': {
      cursor: 'pointer',
    },
    '& img': {
      width: '100%',
    },
  },
  disabledItem: { opacity: 0.5 },
})

interface DatabaseOperation<TRecord extends object> {
  record: TRecord | null
  isLoading: boolean
  lastError: Error | null
  isSuccess: boolean
}

const mapSyncAttachmentTypeToAttachmentType = (
  syncAttachmentType: SyncAttachmentType
): AttachmentType => {
  switch (syncAttachmentType) {
    case SyncAttachmentType.IMAGE_URL:
      return AttachmentType.Image
    case SyncAttachmentType.VIDEO_URL:
      return AttachmentType.Url
    case SyncAttachmentType.YOUTUBE_URL:
      return AttachmentType.Url
    default:
      throw new Error(`Unknown sync attachment type "${syncAttachmentType}"`)
  }
}

const useBulkDataStore = <TRecord extends object>() => {
  const [databaseOperations, setDatabaseOperations] = useState<
    DatabaseOperation<TRecord>[] | null
  >(null)

  const updateDatabaseOperation = (
    index: number,
    stateToMerge: Partial<DatabaseOperation<TRecord>>
  ) => {
    setDatabaseOperations((currentOps) => {
      if (currentOps === null) {
        return currentOps
      }
      return currentOps.map((item, idx) =>
        idx === index
          ? {
              ...item,
              ...stateToMerge,
            }
          : item
      )
    })
  }

  const resetDatabaseOperations = (count: number) => {
    if (count === 0) {
      setDatabaseOperations(null)
      return
    }

    const initialValue = []

    for (let i = 0; i < count; i++) {
      initialValue.push({
        record: null,
        isLoading: true,
        lastError: null,
        isSuccess: false,
      })
    }

    console.debug(`useBulkDataStore.reset`, { count, initialValue })

    setDatabaseOperations(initialValue)
  }

  return {
    databaseOperations,
    resetDatabaseOperations,
    updateDatabaseOperation,
  }
}

const DatabaseOperationOutput = <TRecord extends object>({
  state,
}: {
  state: DatabaseOperation<TRecord>
}) => {
  if (state.isLoading) {
    return <LoadingIndicator message="Working..." />
  }

  if (state.lastError) {
    return <ErrorMessage error={state.lastError}>Failed</ErrorMessage>
  }

  if (state.isSuccess) {
    return <SuccessMessage>Created</SuccessMessage>
  }

  return <>Unknown state</>
}

const AttachmentsSelector = ({
  finalAttachmentIds,
  attachments,
  onDone,
  isDisabled: isFieldDisabled,
}: {
  finalAttachmentIds: string[]
  attachments: SyncAttachment[]
  onDone: (attachmentIds: string[]) => void
  isDisabled: boolean
}) => {
  const [selectedAttachments, setSelectedAttachments] =
    useState<SyncAttachment[]>(attachments)
  const classes = useStyles()
  const {
    databaseOperations,
    resetDatabaseOperations,
    updateDatabaseOperation,
  } = useBulkDataStore()
  const { setField } = useSync()

  const resetEverything = () => {
    resetDatabaseOperations(0)
    onDone([])
  }

  const onClickAttach = async () => {
    try {
      console.debug(`creating ${selectedAttachments.length} attachments...`)

      resetDatabaseOperations(selectedAttachments.length)

      const attachmentsData: Attachment[] = []

      for (const [index, selectedAttachment] of selectedAttachments.entries()) {
        try {
          const url = selectedAttachment.value

          console.debug(`creating attachment "${url}"...`)

          updateDatabaseOperation(index, {
            isLoading: true,
            lastError: null,
            isSuccess: false,
          })

          let urlToUse: string = url

          if (isUrlAnImage(url)) {
            // just download the PNG/WEBP/whatever to our bucket
            // it will be optimized to WEBP automatically later (via SQL triggers)
            urlToUse = await downloadImageByUrl(
              url,
              bucketNames.attachments,
              ''
            )
          }

          const createdRecord = await insertRecord<
            AttachmentFields,
            Attachment
          >(
            CollectionNames.Attachments,
            {
              reason: AttachmentReason.AssetFile,
              type: mapSyncAttachmentTypeToAttachmentType(
                selectedAttachment.type
              ),
              url: urlToUse,
              thumbnailurl: '',
              title: '',
              description: '',
              isadult: null,
              license: '',
              tags: [],
            },
            false
          )

          if (!createdRecord) {
            throw new Error('Created record is empty')
          }

          attachmentsData.push(createdRecord)

          updateDatabaseOperation(index, {
            record: createdRecord,
            isLoading: false,
            lastError: null,
            isSuccess: true,
          })

          console.debug(`created successfully`)
        } catch (err) {
          console.error(err)
          handleError(err)

          updateDatabaseOperation(index, {
            isLoading: false,
            lastError: err as Error,
            isSuccess: false,
          })
        }
      }

      console.debug(`all records have been created`, { attachmentsData })

      const createdIds = attachmentsData.map((attachment) => attachment.id)

      // TODO: Not hardcode this as only applies to assets
      setField('attachmentsdata', attachmentsData)

      onDone(createdIds)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (databaseOperations !== null) {
    const databaseOperationsInProgress = databaseOperations.filter(
      (op) => op.isLoading === true
    )
    return (
      <>
        {databaseOperationsInProgress.length > 0 ? (
          <LoadingIndicator
            message={`Waiting for ${databaseOperationsInProgress.length} attachments...`}
          />
        ) : (
          <>
            <SuccessMessage>
              Attachments have been added to your changes
            </SuccessMessage>
            <Button
              onClick={() => resetEverything()}
              color="default"
              isDisabled={isFieldDisabled}>
              Reset Attachments
            </Button>
            <br />
            <br />
          </>
        )}
        <div className={classes.attachments}>
          {selectedAttachments.map((selectedAttachment, idx) => {
            const databaseOperation = databaseOperations[idx]

            if (!databaseOperation) {
              throw new Error(
                `Could not find database operation at index ${idx} for attachment "${selectedAttachment.value}"`
              )
            }

            return (
              <div
                key={selectedAttachment.value}
                className={classes.attachment}>
                {databaseOperation.isSuccess === true ? (
                  <>Success</>
                ) : (
                  <DatabaseOperationOutput state={databaseOperation} />
                )}
                <div className={classes.attachmentOutput}>
                  {databaseOperation.record !== null ? (
                    <>
                      <AttachmentOutput
                        attachment={databaseOperation.record as Attachment}
                        width="100%"
                      />
                      <br />
                      <AttachmentMeta
                        attachment={databaseOperation.record as Attachment}
                      />
                    </>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  const SubmitButton = () => (
    <FormControls>
      <Button
        onClick={() => onClickAttach()}
        icon={<AttachFileIcon />}
        isDisabled={isFieldDisabled}>
        Attach Selected Items
      </Button>
    </FormControls>
  )

  if (!attachments.length) {
    return <NoResultsMessage>No attachments were found</NoResultsMessage>
  }

  return (
    <div className={classes.attachmentsSelector}>
      <WarningMessage leftAlign>
        Select which attachments you want and click the button:
      </WarningMessage>
      <SubmitButton />
      <div className={classes.attachments}>
        {attachments.map((attachment) => {
          const isSelected =
            selectedAttachments.find(
              (item) => item.value === attachment.value
            ) !== undefined

          const toggleSelected = () =>
            setSelectedAttachments((currentItems) =>
              isSelected
                ? currentItems.filter((item) => item.value !== attachment.value)
                : currentItems.concat([
                    {
                      ...attachment,
                    },
                  ])
            )

          return (
            <div
              key={attachment.value}
              onClick={isFieldDisabled ? undefined : () => toggleSelected()}
              className={classes.attachment}>
              <CheckboxInput
                value={isSelected}
                onChange={() =>
                  isFieldDisabled ? undefined : toggleSelected()
                }
                label=""
                isDisabled={isFieldDisabled}
              />
              <div
                className={`${classes.attachmentOutput} ${
                  isSelected ? '' : classes.disabledItem
                }`}>
                <AttachmentOutput
                  attachment={
                    {
                      url: attachment.value,
                      type: mapSyncAttachmentTypeToAttachmentType(
                        attachment.type
                      ),
                    } as Attachment
                  }
                  width="100%"
                />
              </div>
            </div>
          )
        })}
      </div>
      <SubmitButton />
    </div>
  )
}

export default AttachmentsSelector
