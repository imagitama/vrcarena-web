import React, { useState } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ButtonGroup from '@mui/material/ButtonGroup'
import {
  Quarantine as QuarantineIcon,
  Unquarantine as UnquarantineIcon,
} from '@/icons'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useUserId from '@/hooks/useUserId'
import { handleError } from '@/error-handling'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import { ApprovalStatus, MetaRecord } from '@/modules/common'
import {
  DeclinedReason,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import { declinedReasonMeta } from '@/utils/assets'
import { getAreArraysSame } from '@/utils'

import Button from '@/components/button'
import ErrorMessage from '@/components/error-message'
import ButtonDropdown from '@/components/button-dropdown'

const ApproveButton = ({
  id,
  metaCollectionName,
  existingApprovalStatus,
  existingDeclinedReasons,
  onClick,
  onDone,
  beforeApprove,
  isDisabled,
  showDeclineReasons = true,
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
  isDisabled?: boolean
  showDeclineReasons?: boolean
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
  const isQuarantined = approvalStatus === ApprovalStatus.Quarantined

  const onClickApprove = async () => onNewStatus(ApprovalStatus.Approved)
  const onClickDecline = async () => onNewStatus(ApprovalStatus.Declined)
  const onClickQuarantine = async () => onNewStatus(ApprovalStatus.Quarantined)
  const onClickUnquarantine = async () => onNewStatus(ApprovalStatus.Waiting)

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

      if (newApprovalStatus === ApprovalStatus.Approved) {
        await save({
          approvalstatus: ApprovalStatus.Approved,
          approvedat: new Date().toISOString(),
          approvedby: userId,
          ...(showDeclineReasons
            ? {
                declinedreasons: [],
              }
            : {}),
        })
      } else if (newApprovalStatus === ApprovalStatus.Declined) {
        await save({
          approvalstatus: ApprovalStatus.Declined,
          approvedat: null,
          approvedby: null,
          ...(showDeclineReasons
            ? {
                declinedreasons: selectedReasons,
              }
            : {}),
        })
      } else {
        await save({
          approvalstatus: newApprovalStatus,
          approvedat: null,
          approvedby: null,
        })
      }

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

  const hasChangedReasons = !getAreArraysSame(
    selectedReasons,
    existingDeclinedReasons || []
  )

  return (
    <>
      <Button
        onClick={() => onClickApprove()}
        icon={<CheckCircleIcon />}
        size="small"
        color="secondary"
        hollow={false}
        isDisabled={
          isDisabled ||
          approvalStatus === ApprovalStatus.Approved ||
          isQuarantined
        }
        title="Notifies publisher, shows in search results, etc.">
        Approve
      </Button>{' '}
      <Button
        onClick={() =>
          isQuarantined ? onClickUnquarantine() : onClickQuarantine()
        }
        icon={isQuarantined ? <UnquarantineIcon /> : <QuarantineIcon />}
        size="small"
        color="secondary"
        hollow={false}
        title={
          isQuarantined
            ? 'Returns to waiting in the queue'
            : 'Prevents approval, notifies editors on Discord, shows notice at top of asset'
        }
        isDisabled={isDisabled}>
        {isQuarantined ? 'Un-' : ''}Quarantine
      </Button>{' '}
      <ButtonGroup style={{ width: '100%', marginTop: '0.25rem' }}>
        {isAsset && (
          <>
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
              hollow
              label="Reasons"
              isDisabled={isDisabled || isQuarantined}
              iconSide="right"
            />
            {existingApprovalStatus === ApprovalStatus.Declined &&
              hasChangedReasons && (
                <Button onClick={onClickUpdate} size="small">
                  Save {selectedReasons.length} Reasons
                </Button>
              )}
          </>
        )}
        <Button
          onClick={() => onClickDecline()}
          icon={<CancelIcon />}
          size="small"
          color="secondary"
          hollow={false}
          isDisabled={
            isDisabled ||
            approvalStatus === ApprovalStatus.Declined ||
            isQuarantined
          }
          title="Notifies publisher, they must now un-publish and make changes">
          Decline
          {hasChangedReasons ? ` with ${selectedReasons.length} reasons` : ''}
        </Button>
      </ButtonGroup>
    </>
  )
}

export default ApproveButton
