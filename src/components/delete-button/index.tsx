import React from 'react'
import DeleteIcon from '@material-ui/icons/Delete'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CommonMetaFieldNames } from '../../data-store'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'

import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { AccessStatus, MetaRecord } from '../../modules/common'

const DeleteButton = ({
  id,
  metaCollectionName,
  existingAccessStatus = undefined,
  onClick = undefined,
  onDone = undefined,
}: {
  id: string
  metaCollectionName: string
  existingAccessStatus?: AccessStatus
  onClick?: ({ newValue }: { newValue: AccessStatus }) => void
  onDone?: () => void
}) => {
  const [isLoading, isErroredLoading, metaRecord] =
    useDataStoreItem<MetaRecord>(
      metaCollectionName,
      existingAccessStatus !== undefined ? false : id,
      'delete-button'
    )
  const [isSaving, , isErroredSaving, save] = useDatabaseSave<MetaRecord>(
    metaCollectionName,
    id
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

  if (isErroredLoading || !accessStatus) {
    return <>Failed to load record!</>
  }

  if (isErroredSaving) {
    return <>Failed to save record!</>
  }

  const toggle = async () => {
    try {
      if (!accessStatus) {
        throw new Error('Cannot toggle access - invalid initial status!')
      }

      const newValue =
        accessStatus === AccessStatus.Deleted
          ? AccessStatus.Public
          : AccessStatus.Deleted

      if (onClick) {
        onClick({ newValue })
      }

      await save({
        accessstatus: newValue,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to toggle deleted status', err)
      handleError(err)
    }
  }

  return (
    <Button color="default" onClick={toggle} icon={<DeleteIcon />}>
      {accessStatus === AccessStatus.Deleted ? 'Restore From Trash' : 'Delete'}
    </Button>
  )
}

export default DeleteButton
