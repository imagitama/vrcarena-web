import React, { useState } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { ApprovalStatus, MetaRecord, PublishStatus } from '../../modules/common'
import {
  AssetMeta,
  DeclinedReason,
  CollectionNames as AssetsCollectionNames,
} from '../../modules/assets'
import { declinedReasonMeta } from '../../utils/assets'
import { getAreArraysSame } from '../../utils'

import Button from '../button'
import ErrorMessage from '../error-message'
import ButtonDropdown from '../button-dropdown'

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
  const [isLoading, lastErrorCodeLoading, metaRecord] =
    useDataStoreItem<MetaRecord>(
      metaCollectionName,
      existingApprovalStatus ? false : id,
      'approve-button'
    )
  const [isSaving, , lastErrorCodeSaving, save] = useDatabaseSave<MetaRecord>(
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

      console.debug('Saving...')

      const updatedDocs = await save({
        approvalstatus: newApprovalStatus,
        approvedat:
          newApprovalStatus === ApprovalStatus.Approved ? new Date() : null,
        ...extraFields,
        approvedby: userId,
      })

      if (!updatedDocs.length) {
        console.warn('Save was unsuccessful')
        return
      }

      console.debug('Save success')

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

  if (!approvalStatus) {
    return <>No approval status</>
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
          color="secondary"
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
