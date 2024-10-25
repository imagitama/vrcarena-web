import React, { useState } from 'react'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CancelIcon from '@material-ui/icons/Cancel'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'

import Button from '../button'

import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import ButtonDropdown from '../button-dropdown'
import { ApprovalStatus, MetaRecord, PublishStatus } from '../../modules/common'
import { AssetMeta, DeclinedReason } from '../../modules/assets'
import { declinedReasonMeta } from '../../assets'
import { getAreArraysSame } from '../../utils'

const ApproveButton = ({
  id,
  metaCollectionName,
  existingApprovalStatus = undefined,
  existingDeclinedReasons = undefined,
  onClick = undefined,
  onDone = undefined,
  beforeApprove = undefined,
}: {
  id: string
  metaCollectionName: string
  existingApprovalStatus?: ApprovalStatus
  // assets
  existingDeclinedReasons?: DeclinedReason[]
  onClick?: ({
    newApprovalStatus,
  }: {
    newApprovalStatus: ApprovalStatus
  }) => void
  onDone?: () => void
  beforeApprove?: () => boolean | Promise<boolean> // false to cancel approval
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
  const [selectedReasons, setSelectedReasons] = useState<DeclinedReason[]>(
    existingDeclinedReasons || []
  )

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

  const isAsset = metaCollectionName === CollectionNames.AssetMeta

  const onClickApprove = async () => onNewStatus(ApprovalStatus.Approved)
  const onClickDecline = async () => onNewStatus(ApprovalStatus.Declined)

  const onNewStatus = async (newApprovalStatus: ApprovalStatus) => {
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

      const extraFields = isAsset
        ? ({
            ...(newApprovalStatus === ApprovalStatus.Declined
              ? ({
                  publishstatus: PublishStatus.Draft,
                  declinedreasons: selectedReasons,
                } as AssetMeta)
              : {
                  declinedreasons: [],
                }),
          } as AssetMeta)
        : {}

      await save({
        approvalstatus: newApprovalStatus,
        approvedat:
          newApprovalStatus === ApprovalStatus.Approved ? new Date() : null,
        ...extraFields,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save approval status', err)
      handleError(err)
    }
  }

  const onClickUpdate = async () => {
    try {
      await save({
        declinedreasons: selectedReasons,
      } as AssetMeta)

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to update reason', err)
      handleError(err)
    }
  }

  return (
    <>
      <Button
        onClick={() => onClickApprove()}
        icon={<CheckCircleIcon />}
        size="small"
        isDisabled={approvalStatus === ApprovalStatus.Approved}>
        Approve
      </Button>
      <div style={{ marginTop: '0.25rem' }} />
      {isAsset && (
        <ButtonDropdown
          color="default"
          options={declinedReasonMeta.map((meta) => ({
            id: meta.reason,
            label: meta.label,
          }))}
          selectedIds={selectedReasons}
          onSelect={(newReason: string) =>
            setSelectedReasons((currentReasons) =>
              currentReasons.includes(newReason as DeclinedReason)
                ? currentReasons.filter((id) => id !== newReason)
                : currentReasons.concat([newReason as DeclinedReason])
            )
          }
          closeOnSelect={false}
          size="small"
        />
      )}
      <Button
        onClick={() => onClickDecline()}
        icon={<CancelIcon />}
        size="small"
        isDisabled={approvalStatus === ApprovalStatus.Declined}>
        Decline{isAsset ? ' & Draft' : ''}
      </Button>
      {isAsset &&
        existingDeclinedReasons !== undefined &&
        !getAreArraysSame(existingDeclinedReasons, selectedReasons) && (
          <Button onClick={onClickUpdate} size="small">
            Update Reason
          </Button>
        )}
    </>
  )
}

export default ApproveButton
