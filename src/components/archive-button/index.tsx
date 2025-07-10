import React, { useState } from 'react'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { AccessStatus, MetaRecord } from '../../modules/common'
import { archivedReasonMeta } from '../../utils/assets'
import {
  ArchivedReason,
  CollectionNames as AssetCollectionNames,
  AssetMeta,
} from '../../modules/assets'

import ButtonDropdown from '../button-dropdown'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'

const ArchiveButton = ({
  id,
  metaCollectionName,
  existingAccessStatus = undefined,
  existingArchivedReason = undefined,
  onClick = undefined,
  onDone = undefined,
}: {
  id: string
  metaCollectionName: string
  existingAccessStatus?: AccessStatus
  existingArchivedReason?: ArchivedReason | null
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
  const [selectedReason, setSelectedReason] = useState<ArchivedReason | null>(
    existingArchivedReason || null
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

  const isAsset = metaCollectionName === AssetCollectionNames.AssetsMeta

  const onClickButton = async () => {
    try {
      if (!accessStatus) {
        throw new Error('Cannot toggle access - invalid initial status!')
      }

      const newAccessStatus =
        accessStatus === AccessStatus.Archived
          ? AccessStatus.Public
          : AccessStatus.Archived

      if (onClick) {
        onClick({ newValue: newAccessStatus })
      }

      const extraFields = isAsset
        ? ({
            archivedreason:
              newAccessStatus === AccessStatus.Archived ? selectedReason : null,
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
      console.error('Failed to toggle access status', err)
      handleError(err)
    }
  }

  const onClickUpdate = async () => {
    try {
      await save({
        archivedreason: selectedReason,
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
      {isAsset && (
        <ButtonDropdown
          color="secondary"
          options={archivedReasonMeta
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
            setSelectedReason(newReason ? (newReason as ArchivedReason) : null)
          }
          closeOnSelect={true}
          size="small"
        />
      )}
      <Button
        onClick={onClickButton}
        icon={<BusinessCenterIcon />}
        size="small">
        {accessStatus === AccessStatus.Archived ? 'Un-archive' : 'Archive'}
      </Button>
      {existingArchivedReason !== undefined &&
        existingArchivedReason !== selectedReason && (
          <Button onClick={onClickUpdate} size="small">
            Save Reason
          </Button>
        )}
    </>
  )
}

export default ArchiveButton
