import React, { useState } from 'react'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import { CommonMetaFieldNames, CommonMetaRecordFields } from '../../data-store'
import useUserId from '../../hooks/useUserId'

import Button from '../button'

import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import ButtonDropdown from '../button-dropdown'
import HintText from '../hint-text'
import { colorPalette } from '../../config'
import { ApprovalStatus, MetaRecord, PublishStatus } from '../../modules/common'

const useStyles = makeStyles({
  control: {
    marginTop: '0.25rem',
  },
  status: {
    textAlign: 'center',
  },
  approved: {
    color: colorPalette.positive,
  },
  waiting: {
    color: colorPalette.warning,
  },
  declined: {
    color: colorPalette.negative,
  },
})

const getClassForApprovalStatus = (
  approvalStatus: ApprovalStatus,
  classes: ReturnType<typeof useStyles>
): string => {
  switch (approvalStatus) {
    case ApprovalStatus.Approved:
      return classes.approved
    case ApprovalStatus.Waiting:
      return classes.waiting
    case ApprovalStatus.Declined:
      return classes.declined
    default:
      console.warn(
        `Cannot get class for approval status: unknown status "${approvalStatus}"!`
      )
      return ''
  }
}

const getLabelForApprovalStatus = (approvalStatus: ApprovalStatus): string => {
  switch (approvalStatus) {
    case ApprovalStatus.Approved:
      return 'Approved'
    case ApprovalStatus.Waiting:
      return 'Waiting For Approval'
    case ApprovalStatus.Declined:
      return 'Declined'
    default:
      console.warn(
        `Cannot get label for approval status: unknown status "${approvalStatus}"!`
      )
      return approvalStatus
  }
}

const declineOptions = [
  {
    id: 'breaches_guidelines',
    label: 'Breaches our guidelines: https://www.vrcarena.com/guidelines',
  },
  {
    id: 'duplicate',
    label: 'Duplicate of another asset',
  },
  {
    id: 'missing_source',
    label: 'Missing source URL',
  },
  {
    id: 'invalid_source',
    label: 'Invalid source URL',
  },
  {
    id: 'missing_thumbnail',
    label: 'Missing thumbnail',
  },
  {
    id: 'invalid_thumbnail',
    label: 'Invalid thumbnail',
  },
  {
    id: 'missing_title',
    label: 'Missing title',
  },
  {
    id: 'invalid_title',
    label: 'Invalid title',
  },
  {
    id: 'missing_author',
    label: 'Missing author',
  },
  {
    id: 'incorrect_author',
    label: 'Incorrect author',
  },
  {
    id: 'missing_category',
    label: 'Missing category',
  },
  {
    id: 'incorrect_category',
    label: 'Incorrect category',
  },
  {
    id: 'missing_description',
    label: 'Missing description',
  },
  {
    id: 'too_short_description',
    label: 'Too short description',
  },
  {
    id: 'missing_tags',
    label: 'Missing tags',
  },
  {
    id: 'not_many_tags',
    label: 'Too few tags',
  },
  {
    id: 'missing_species',
    label: 'Missing species',
  },
  {
    id: 'incorrect_species',
    label: 'Incorrect species',
  },
  {
    id: 'missing_nsfw_flag',
    label: 'Should be flagged NSFW',
  },
]

const ApproveButton = ({
  id,
  metaCollectionName,
  existingApprovalStatus = undefined,
  existingPublishStatus = undefined,
  onClick = undefined,
  onDone = undefined,
  beforeApprove = undefined,
  allowDeclineOptions = false,
}: {
  id: string
  metaCollectionName: string
  existingApprovalStatus?: ApprovalStatus
  existingPublishStatus?: PublishStatus
  onClick?: ({
    newApprovalStatus,
  }: {
    newApprovalStatus: ApprovalStatus
  }) => void
  onDone?: () => void
  beforeApprove?: () => boolean | Promise<boolean> // false to cancel approval
  allowDeclineOptions?: boolean
}) => {
  const userId = useUserId()
  const [isLoading, isErroredLoading, metaRecord] =
    useDataStoreItem<MetaRecord>(
      metaCollectionName,
      existingApprovalStatus ? false : id,
      'approve-button'
    )
  const [isSaving, , isSaveError, save] = useDatabaseSave<MetaRecord>(
    metaCollectionName,
    id
  )
  const classes = useStyles()
  const [selectedDeclineOptionIds, setSelectedDeclineOptionIds] = useState<
    string[]
  >([])

  if (!userId || isLoading) {
    return <>Loading...</>
  }

  if (isSaving) {
    return <>Saving...</>
  }

  if (isErroredLoading) {
    return <>Failed to load approve button</>
  }

  if (!existingApprovalStatus && !metaRecord) {
    return <>No existing approval status and no meta record</>
  }

  if (isSaveError) {
    return <>Failed to save</>
  }

  const approvalStatus = existingApprovalStatus
    ? existingApprovalStatus
    : metaRecord
    ? metaRecord.approvalstatus
    : undefined
  const publishStatus = existingPublishStatus
    ? existingPublishStatus
    : metaRecord
    ? metaRecord.publishstatus
    : undefined

  if (!approvalStatus || !publishStatus) {
    return <>Waiting for data...</>
  }

  const isAsset = metaCollectionName === CollectionNames.AssetMeta

  const setNewApprovalStatus = async (newApprovalStatus: ApprovalStatus) => {
    try {
      if (onClick) {
        onClick({ newApprovalStatus })
      }

      if (beforeApprove) {
        const result = await beforeApprove()

        if (result !== true) {
          throw new Error('Before approve did not pass')
        }
      }

      const newEditorNotes = `${selectedDeclineOptionIds
        .map((id) => declineOptions.find((option) => option.id === id)!.label)
        .join(', ')}${
        metaRecord && metaRecord.editornotes
          ? `
      
${metaRecord.editornotes}`
          : ''
      }`

      await save({
        approvalstatus: newApprovalStatus,
        approvedat:
          newApprovalStatus === ApprovalStatus.Approved ? new Date() : null,
        ...(isAsset && newApprovalStatus === ApprovalStatus.Declined
          ? {
              [CommonMetaFieldNames.publishStatus]: PublishStatus.Draft,
            }
          : {}),
        ...(allowDeclineOptions && selectedDeclineOptionIds.length
          ? { [CommonMetaFieldNames.editorNotes]: newEditorNotes }
          : {}),
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save approval status', err)
      handleError(err)
    }
  }

  if (publishStatus && publishStatus !== PublishStatus.Published) {
    return <>Record is a draft and cannot be approved yet</>
  }

  return (
    <>
      <div
        className={`${classes.status} ${getClassForApprovalStatus(
          approvalStatus,
          classes
        )}`}>
        Status: <strong>{getLabelForApprovalStatus(approvalStatus)}</strong>
      </div>
      {approvalStatus !== ApprovalStatus.Approved ? (
        <div className={classes.control}>
          <Button
            onClick={() => setNewApprovalStatus(ApprovalStatus.Approved)}
            icon={<CheckIcon />}>
            Approve
          </Button>
        </div>
      ) : null}
      {approvalStatus !== ApprovalStatus.Declined ? (
        <>
          {allowDeclineOptions ? (
            <div className={classes.control}>
              <ButtonDropdown
                color="default"
                options={declineOptions}
                selectedIds={selectedDeclineOptionIds}
                onSelect={(newId: string) =>
                  setSelectedDeclineOptionIds((currentIds) =>
                    currentIds.includes(newId)
                      ? currentIds.filter((id) => id !== newId)
                      : currentIds.concat([newId])
                  )
                }
                label={`Decline Reasons (${selectedDeclineOptionIds.length})`}
                closeOnSelect={false}
              />
              <HintText small>Adds to public editor notes</HintText>
            </div>
          ) : null}
          <div className={classes.control}>
            <Button
              onClick={() => setNewApprovalStatus(ApprovalStatus.Declined)}
              icon={<ClearIcon />}>
              Decline
              {isAsset ? ' (and Draft)' : ''}
            </Button>
          </div>
        </>
      ) : null}
    </>
  )
}

export default ApproveButton
