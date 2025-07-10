import React from 'react'
import CheckIcon from '@mui/icons-material/Check'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

import Button from '../button'

import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'
import { DataStoreErrorCode } from '../../data-store'
import { CollectionNames, Endorsement } from '../../modules/endorsements'
import useDataStoreDelete from '../../hooks/useDataStoreDelete'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'

const getLabel = (
  isLoggedIn: boolean,
  isLoading: boolean,
  isAlreadyEndorsed: boolean,
  isSaving: boolean,
  lastErrorCode: null | DataStoreErrorCode,
  isAddingSuccess: boolean,
  isRemovingSuccess: boolean
) => {
  if (!isLoggedIn) {
    return 'Log in to endorse'
  }

  if (isLoading) {
    return 'Loading...'
  }

  if (lastErrorCode) {
    return `Error: ${lastErrorCode}`
  }

  if (isAlreadyEndorsed && isAddingSuccess) {
    return 'Added your endorsement!'
  }

  if (!isAlreadyEndorsed && isRemovingSuccess) {
    return 'Removed your endorsement!'
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isAlreadyEndorsed) {
    return 'Remove Endorsement'
  }

  return 'Endorse'
}

const getIcon = (
  isLoggedIn: boolean,
  isLoading: boolean,
  isAlreadyEndorsed: boolean,
  isSaving: boolean,
  lastErrorCode: null | DataStoreErrorCode,
  isAddingSuccess: boolean,
  isRemovingSuccess: boolean
) => {
  if (!isLoggedIn) {
    return <ThumbUpIcon />
  }

  if (isLoading || lastErrorCode !== null || isSaving) {
    return undefined
  }

  if (isAddingSuccess || isRemovingSuccess) {
    return <CheckIcon />
  }

  if (isAlreadyEndorsed) {
    return <HighlightOffIcon />
  }

  return <ThumbUpIcon />
}

const EndorseAssetButton = ({
  isAssetLoading,
  assetId,
  endorsementCount = '???',
  onClick = undefined,
  onDone = undefined,
}: {
  isAssetLoading: boolean
  assetId: string
  endorsementCount: number | string
  onClick?: (props: { newValue: boolean }) => void | Promise<void>
  onDone?: () => void | Promise<void>
}) => {
  const userId = useUserId()
  const [
    isLoadingEndorsements,
    lastErrorCodeLoadingEndorsements,
    myEndorsements,
    hydrate,
  ] = useDatabaseQuery<Endorsement>(
    CollectionNames.Endorsements,
    userId
      ? [
          ['createdby', Operators.EQUALS, userId],
          ['asset', Operators.EQUALS, assetId],
        ]
      : false,
    {
      queryName: 'get-my-endorsements',
    }
  )

  const isLoggedIn = !!userId
  const isAlreadyEndorsed =
    Array.isArray(myEndorsements) && myEndorsements.length === 1 ? true : false

  const [isAdding, isAddingSuccess, lastSavingErrorCode, create] =
    useDataStoreCreate<Endorsement>(CollectionNames.Endorsements)
  const [
    isRemoving,
    isDeleteSuccess,
    lastDeletingErrorCode,
    deleteEndorsementRecord,
  ] = useDataStoreDelete(
    CollectionNames.Endorsements,
    isAlreadyEndorsed ? myEndorsements![0].id : false
  )

  const addEndorsement = async () => {
    try {
      if (!isLoggedIn) {
        return
      }

      if (onClick) {
        onClick({
          newValue: true,
        })
      }

      await create({ asset: assetId })

      // if (onDone) {
      //   onDone()
      // }

      hydrate()
    } catch (err) {
      console.error('Failed to perform save', err)
      handleError(err)
    }
  }

  const removeEndorsement = async () => {
    try {
      if (!isLoggedIn) {
        return
      }

      if (onClick) {
        onClick({
          newValue: false,
        })
      }

      await deleteEndorsementRecord()

      // if (onDone) {
      //   onDone()
      // }

      hydrate()
    } catch (err) {
      console.error('Failed to remove endorsement', err)
      handleError(err)
    }
  }

  const onClickBtn = async () => {
    if (!isLoggedIn) {
      return
    }

    if (isAlreadyEndorsed) {
      await removeEndorsement()
    } else {
      await addEndorsement()
    }
  }

  return (
    <Button
      color="secondary"
      icon={getIcon(
        isLoggedIn,
        isLoadingEndorsements,
        isAlreadyEndorsed,
        isAdding || isRemoving,
        lastSavingErrorCode ||
          lastDeletingErrorCode ||
          lastErrorCodeLoadingEndorsements, // TODO: No truthy
        isAddingSuccess,
        isDeleteSuccess
      )}
      onClick={onClickBtn}
      isLoading={isAssetLoading}>
      {getLabel(
        isLoggedIn,
        isLoadingEndorsements,
        isAlreadyEndorsed,
        isAdding || isRemoving,
        lastSavingErrorCode ||
          lastDeletingErrorCode ||
          lastErrorCodeLoadingEndorsements, // TODO: No truthy
        isAddingSuccess,
        isDeleteSuccess
      )}{' '}
      ({endorsementCount})
    </Button>
  )
}

export default EndorseAssetButton
