import React, { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'

import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { AccessStatus, MetaRecord } from '../../modules/common'
import ButtonDropdown from '../button-dropdown'
import { deletionReasonMeta } from '../../utils/assets'
import {
  DeletionReason,
  CollectionNames as AssetCollectionNames,
  AssetMeta,
} from '../../modules/assets'

const DeleteButton = ({
  id,
  metaCollectionName,
  existingAccessStatus = undefined,
  existingDeletionReason = undefined,
  onClick = undefined,
  onDone = undefined,
}: {
  id: string
  metaCollectionName: string
  existingAccessStatus?: AccessStatus
  existingDeletionReason?: DeletionReason | null
  onClick?: ({ newValue }: { newValue: AccessStatus }) => void
  onDone?: () => void
}) => {
  const [isLoading, lastErrorCodeLoading, metaRecord] =
    useDataStoreItem<MetaRecord>(
      metaCollectionName,
      existingAccessStatus !== undefined ? false : id,
      'delete-button'
    )
  const [isSaving, , lastErrorCodeSaving, save] = useDataStoreEdit<MetaRecord>(
    metaCollectionName,
    id
  )
  const [selectedReason, setSelectedReason] = useState<DeletionReason | null>(
    existingDeletionReason || null
  )

  if (isLoading || isSaving) {
    return <LoadingIndicator message={isLoading ? 'Loading...' : 'Saving...'} />
  }

  if (!existingAccessStatus && !metaRecord) {
    console.warn(
      'Cannot render button: no existing access status and no meta record'
    )
    return null
  }

  const accessStatus =
    existingAccessStatus || (metaRecord ? metaRecord.accessstatus : undefined)

  if (lastErrorCodeLoading !== null) {
    return <>Failed to load record (code {lastErrorCodeLoading})</>
  }

  if (!accessStatus) {
    return <>Failed to load record (invalid access status)</>
  }

  if (lastErrorCodeSaving !== null) {
    return <>Failed to save record (code {lastErrorCodeSaving})</>
  }

  const toggle = async () => {
    try {
      if (!accessStatus) {
        throw new Error('Cannot toggle access - invalid initial status!')
      }

      const newAccessStatus =
        accessStatus === AccessStatus.Deleted
          ? AccessStatus.Public
          : AccessStatus.Deleted

      if (onClick) {
        onClick({ newValue: newAccessStatus })
      }

      const extraFields = isAsset
        ? ({
            deletionreason:
              newAccessStatus === AccessStatus.Deleted ? selectedReason : null,
          } as AssetMeta)
        : {}

      await save({
        accessstatus: newAccessStatus,
        ...extraFields,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to toggle deleted status', err)
      handleError(err)
    }
  }

  const onClickUpdate = async () => {
    try {
      await save({
        deletionreason: selectedReason,
      } as AssetMeta)

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to update reason', err)
      handleError(err)
    }
  }

  const isAsset = metaCollectionName === AssetCollectionNames.AssetsMeta

  return (
    <>
      {isAsset && (
        <ButtonDropdown
          color="secondary"
          options={deletionReasonMeta
            .map((meta) => ({
              id: meta.reason as string,
              label: meta.label,
            }))
            .concat([
              {
                id: '',
                label: '(none)',
              },
            ])}
          selectedId={selectedReason || ''}
          onSelect={(newReason: string) =>
            setSelectedReason(newReason ? (newReason as DeletionReason) : null)
          }
          closeOnSelect={true}
          size="small"
        />
      )}
      <Button onClick={toggle} icon={<DeleteIcon />} size="small">
        {accessStatus === AccessStatus.Deleted ? 'Un-delete' : 'Delete'}
      </Button>
      {isAsset &&
        existingDeletionReason !== undefined &&
        existingDeletionReason !== selectedReason && (
          <Button onClick={onClickUpdate} size="small">
            Update Reason
          </Button>
        )}
    </>
  )
}

export default DeleteButton
