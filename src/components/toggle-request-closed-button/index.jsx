import React from 'react'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import {
  CollectionNames,
  RequestsFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'

import Button from '../button'
import useDataStoreItem from '../../hooks/useDataStoreItem'

export default ({ requestId, onClick = null }) => {
  const userId = useUserId()
  const [isLoadingRequest, isErroredLoadingRequest, request] = useDataStoreItem(
    CollectionNames.Requests,
    requestId,
    'toggle-request-closed-btn'
  )
  const [isSaving, , isSaveError, save] = useDatabaseSave(
    CollectionNames.Requests,
    requestId
  )

  // TODO: Check if they are allowed to close this - relying on parent to do this is bad!
  if (!userId) {
    return null
  }

  if (isLoadingRequest) {
    // TODO: Remove this code duplication
    return <Button color="default">Loading...</Button>
  }

  if (isSaving) {
    return <Button color="default">Saving...</Button>
  }

  if ((isErroredLoadingRequest, isSaveError)) {
    return <Button disabled>Error</Button>
  }

  const { [RequestsFieldNames.isClosed]: isClosed } = request

  const onBtnClick = async () => {
    try {
      const newValue = !isClosed

      if (onClick) {
        onClick({ newValue })
      }

      await save({
        [RequestsFieldNames.isClosed]: newValue
      })
    } catch (err) {
      console.error('Failed to toggle is closed', err)
      handleError(err)
    }
  }

  return (
    <Button color="default" onClick={onBtnClick}>
      {isClosed ? 'Re-open' : 'Mark as closed'}
    </Button>
  )
}
