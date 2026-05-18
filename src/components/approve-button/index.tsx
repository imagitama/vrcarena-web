import React, { useState } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useUserId from '@/hooks/useUserId'
import { handleError } from '@/error-handling'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import { ApprovalStatus, MetaRecord, PublishStatus } from '@/modules/common'
import {
  AssetMeta,
  DeclinedReason,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import { declinedReasonMeta } from '@/utils/assets'
import { getAreArraysSame } from '@/utils'

import Button from '@/components/button'
import ErrorMessage from '@/components/error-message'
import ButtonDropdown from '@/components/button-dropdown'

function fullDiff<T>(prev: T[], next: T[]) {
  const prevSet = new Set(prev)
  const nextSet = new Set(next)
  return {
    added: next.filter((x) => !prevSet.has(x)),
    removed: prev.filter((x) => !nextSet.has(x)),
  }
}

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
  existingDeclinedReasons?: DeclinedReason[] | null
  onClick?: ({
    newApprovalStatus,
  }: {
    newApprovalStatus: ApprovalStatus
  }) => void
  onDone?: () => void
  beforeApprove?: () => boolean | Promise<boolean> // false to cancel approval
}) => {
  const userId = useUserId()
  const [isLoading, lastErrorCodeLoading, metaRecord] =
    useDataStoreItem<MetaRecord>(
      metaCollectionName,
      existingApprovalStatus ? false : id,
      { queryName: 'approve-button' }
    )
  const [isSaving, , lastErrorCodeSaving, save] = useDataStoreEdit<MetaRecord>(
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

  if (lastErrorCodeLoading !== null) {
    return (
      <ErrorMessage>Failed to load (code {lastErrorCodeLoading})</ErrorMessage>
    )
  }

  if (!existingApprovalStatus && !metaRecord) {
    return <>No existing approval status and no meta record</>
  }

  if (lastErrorCodeSaving !== null) {
    return (
      <ErrorMessage>
        Failed to save meta record (code {lastErrorCodeSaving})
      </ErrorMessage>
    )
  }

  const approvalStatus = existingApprovalStatus
    ? existingApprovalStatus
    : metaRecord
    ? metaRecord.approvalstatus
    : undefined

  const isAsset = metaCollectionName === AssetsCollectionNames.AssetsMeta

  const onClickApprove = async () => onNewStatus(ApprovalStatus.Approved)
  const onClickDecline = async () => onNewStatus(ApprovalStatus.Declined)

  const onNewStatus = async (newApprovalStatus: ApprovalStatus) => {
    try {
      if (onClick) {
        onClick({ newApprovalStatus })
      }

      if (newApprovalStatus === ApprovalStatus.Approved && beforeApprove) {
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
          newApprovalStatus === ApprovalStatus.Approved
            ? new Date().toISOString()
            : null,
        ...extraFields,
        approvedby: userId,
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
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to update reason', err)
      handleError(err)
    }
  }

  if (!approvalStatus) {
    return <>No approval status</>
  }

  return (
    <>
      <Button
        onClick={() => onClickApprove()}
        icon={<CheckCircleIcon />}
        size="small"
        color="secondary"
        isDisabled={approvalStatus === ApprovalStatus.Approved}>
        Approve
      </Button>
      <div style={{ marginTop: '0.25rem' }} />
      {isAsset && (
        <ButtonDropdown
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
          iconOnly
          hollow
          label="Reasons"
        />
      )}
      <Button
        onClick={() => onClickDecline()}
        icon={<CancelIcon />}
        size="small"
        color="secondary"
        isDisabled={approvalStatus === ApprovalStatus.Declined}>
        Decline{isAsset ? ' & Draft' : ''}
      </Button>
      {existingDeclinedReasons &&
        !getAreArraysSame(selectedReasons, existingDeclinedReasons) && (
          <div style={{ marginTop: '0.25rem' }}>
            New reasons:
            <ul>
              {selectedReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <Button onClick={onClickUpdate} size="small" color="secondary">
              Save
            </Button>
          </div>
        )}
    </>
  )
}

export default ApproveButton
