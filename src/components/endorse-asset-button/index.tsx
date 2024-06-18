import React from 'react'
import CheckIcon from '@material-ui/icons/Check'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'

import Button from '../button'

import useDatabaseQuery, {
  CollectionNames,
  EndorsementFieldNames,
  Operators,
  options,
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { DataStoreErrorCode } from '../../data-store'

const getLabel = (
  isLoggedIn: boolean,
  isLoading: boolean,
  isAlreadyEndorsed: boolean,
  isSaving: boolean,
  lastErrorCode: null | DataStoreErrorCode,
  isSuccess: boolean
) => {
  if (!isLoggedIn) {
    return 'Log in to endorse'
  }

  if (isLoading) {
    return 'Loading...'
  }

  if (lastErrorCode) {
    return 'Error!'
  }

  if (isSaving) {
    if (isAlreadyEndorsed) {
      return 'Removing endorsement...'
    } else {
      return 'Adding endorsement...'
    }
  }

  if (isSuccess) {
    if (isAlreadyEndorsed) {
      return 'Removed your endorsement!'
    } else {
      return 'Added your endorsement!'
    }
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
  lastErrorCode: null | boolean | DataStoreErrorCode,
  isSuccess: boolean
) => {
  if (!isLoggedIn) {
    return <ThumbUpIcon />
  }

  if (isLoading) {
    return undefined
  }

  if (lastErrorCode) {
    return undefined
  }

  if (isSaving) {
    if (isAlreadyEndorsed) {
      return undefined
    } else {
      return undefined
    }
  }

  if (isSuccess) {
    return <CheckIcon />
  }

  if (isAlreadyEndorsed) {
    return <HighlightOffIcon />
  }

  return <ThumbUpIcon />
}

interface Endorsement {
  id: string
}

export default ({
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
  ] = useDatabaseQuery<Endorsement>(
    CollectionNames.Endorsements,
    userId
      ? [
          [
            EndorsementFieldNames.createdBy,
            Operators.EQUALS,
            createRef(CollectionNames.Users, userId),
          ],
          [
            EndorsementFieldNames.asset,
            Operators.EQUALS,
            createRef(CollectionNames.Assets, assetId),
          ],
        ]
      : false,
    {
      [options.queryName]: 'get-my-endorsements',
    }
  )

  const isLoggedIn = !!userId
  const isAlreadyEndorsed =
    Array.isArray(myEndorsements) && myEndorsements.length === 1 ? true : false

  const [isSaving, isSavingSuccess, lastSavingErrorCode, createOrDelete] =
    useDatabaseSave(
      CollectionNames.Endorsements,
      isAlreadyEndorsed && Array.isArray(myEndorsements)
        ? myEndorsements[0].id
        : null,
      isAlreadyEndorsed
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

      await createOrDelete({
        [EndorsementFieldNames.asset]: createRef(
          CollectionNames.Assets,
          assetId
        ),
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to create endorsement', err)
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

      await createOrDelete()

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to delete endorsement', err)
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
      color="default"
      icon={getIcon(
        isLoggedIn,
        isLoadingEndorsements,
        isAlreadyEndorsed,
        isSaving,
        lastSavingErrorCode || lastErrorCodeLoadingEndorsements,
        isSavingSuccess
      )}
      onClick={onClickBtn}
      isLoading={isAssetLoading}>
      {getLabel(
        isLoggedIn,
        isLoadingEndorsements,
        isAlreadyEndorsed,
        isSaving,
        lastSavingErrorCode || lastErrorCodeLoadingEndorsements,
        isSavingSuccess
      )}{' '}
      ({endorsementCount})
    </Button>
  )
}
