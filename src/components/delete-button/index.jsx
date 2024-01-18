import React from 'react'
import DeleteIcon from '@material-ui/icons/Delete'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { AccessStatuses } from '../../hooks/useDatabaseQuery'
import { CommonMetaFieldNames } from '../../data-store'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'

import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'

const DeleteButton = ({
  id,
  metaCollectionName,
  existingAccessStatus = undefined,
  onClick = undefined,
  onDone = undefined,
}) => {
  const [isLoading, isErroredLoading, metaRecord] = useDataStoreItem(
    metaCollectionName,
    existingAccessStatus !== undefined ? false : id,
    'delete-button'
  )
  const [isSaving, , isErroredSaving, save] = useDatabaseSave(
    metaCollectionName,
    id
  )

  if (isLoading || isSaving) {
    return <LoadingIndicator message={isLoading ? 'Loading...' : 'Saving...'} />
  }

  if (!existingAccessStatus && !metaRecord) {
    return <>No record found</>
  }

  const accessStatus =
    existingAccessStatus || metaRecord[CommonMetaFieldNames.accessStatus]

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
        accessStatus === AccessStatuses.Deleted
          ? AccessStatuses.Public
          : AccessStatuses.Deleted

      if (onClick) {
        onClick({ newValue })
      }

      await save({
        [CommonMetaFieldNames.accessStatus]: newValue,
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
      {accessStatus === AccessStatuses.Deleted
        ? 'Restore From Trash'
        : 'Delete'}
    </Button>
  )
}

export default DeleteButton
