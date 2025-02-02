import React, { useState } from 'react'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'

import useDatabaseSave from '../../hooks/useDatabaseSave'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'

import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import {
  CollectionNames,
  ReportMeta,
  ResolutionStatus,
} from '../../modules/reports'
import useUserId from '../../hooks/useUserId'
import TextInput from '../text-input'

export default ({
  id,
  existingResolutionStatus,
  existingResolutionNotes,
  onClick,
  onDone,
}: {
  id: string
  existingResolutionStatus?: string // pending | resolved
  existingResolutionNotes?: string
  onClick?: (newValue: string) => void
  onDone?: () => void
}) => {
  const [isLoading, isErroredLoading, metaRecord] =
    useDataStoreItem<ReportMeta>(
      CollectionNames.ReportsMeta,
      existingResolutionStatus ? false : id,
      'resolve-button'
    )
  const [isSaving, , isErroredSaving, save] = useDatabaseSave(
    CollectionNames.ReportsMeta,
    id
  )
  const userId = useUserId()
  const [newResolutionNotes, setNewResolutionNotes] = useState(
    existingResolutionNotes || ''
  )

  if (isLoading || isSaving) {
    return <LoadingIndicator message={isLoading ? 'Loading...' : 'Saving...'} />
  }

  if (!existingResolutionStatus && !metaRecord) {
    console.warn(
      'Cannot render resolution controls: no existing resolution status and no meta record'
    )
    return null
  }

  const resolutionStatus =
    existingResolutionStatus ||
    (!existingResolutionStatus && metaRecord
      ? metaRecord.resolutionstatus
      : null)

  if (isErroredLoading || !resolutionStatus) {
    return <>Failed to load record!</>
  }

  if (isErroredSaving) {
    return <>Failed to save record!</>
  }

  const toggle = async () => {
    try {
      if (!resolutionStatus) {
        throw new Error('Cannot toggle access - invalid initial status!')
      }

      const newResolutionStatus =
        resolutionStatus === ResolutionStatus.Pending
          ? ResolutionStatus.Resolved
          : ResolutionStatus.Pending
      const newResolvedAt =
        newResolutionStatus === ResolutionStatus.Resolved ? new Date() : null
      const newResolvedBy =
        newResolutionStatus === ResolutionStatus.Resolved ? userId : null

      if (onClick) {
        onClick(newResolutionStatus)
      }

      await save({
        resolutionstatus: newResolutionStatus,
        resolvedat: newResolvedAt,
        resolvedby: newResolvedBy,
        resolutionnotes: newResolutionNotes,
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
    <>
      <Button
        color="default"
        onClick={toggle}
        icon={
          resolutionStatus === ResolutionStatus.Pending ? (
            <CheckIcon />
          ) : resolutionStatus === ResolutionStatus.Resolved ? (
            <ClearIcon />
          ) : undefined
        }>
        {resolutionStatus === ResolutionStatus.Pending
          ? 'Resolve'
          : resolutionStatus === ResolutionStatus.Resolved
          ? 'Return To Pending'
          : 'UNKNOWN'}
      </Button>
      <br />
      <br />
      Resolution notes (public):
      <TextInput
        fullWidth
        minRows={5}
        multiline
        onChange={(e) => setNewResolutionNotes(e.target.value)}
        value={newResolutionNotes}
      />
    </>
  )
}
