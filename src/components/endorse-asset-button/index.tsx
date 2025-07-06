import React from 'react'
import CheckIcon from '@mui/icons-material/Check'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

import Button from '../button'

import useDatabaseQuery, {
  Operators,
  options,
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'
import { DataStoreErrorCode } from '../../data-store'
import { CollectionNames, Endorsement } from '../../modules/endorsements'

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
  ] = useDatabaseQuery<Endorsement>(
    CollectionNames.Endorsements,
    userId
      ? [
          ['createdby', Operators.EQUALS, userId],
          ['asset', Operators.EQUALS, assetId],
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
    useDatabaseSave<Endorsement>(
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

      const result = await createOrDelete({
        asset: assetId,
      })

      if (!result.length) {
        throw new Error('Failed to save')
      }

      if (onDone) {
        onDone()
      }
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

      const result = await createOrDelete()

      if (!result.length) {
        throw new Error('Failed to perform removal')
      }

      if (onDone) {
        onDone()
      }
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

export default EndorseAssetButton
