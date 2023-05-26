import React, { useState } from 'react'
import CheckIcon from '@material-ui/icons/Check'
import StarIcon from '@material-ui/icons/Star'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'

import Button from '../button'

import {
  FeaturedStatuses
} from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'

const FeatureAssetErrorCodes = {
  NOT_ALLOWED: 'NOT_ALLOWED',
  NOT_PUBLIC: 'NOT_PUBLIC',
  ALREADY_FEATURED: 'ALREADY_FEATURED',
  NOT_CREATOR: 'NOT_CREATOR',
  LIMIT_REACHED: 'LIMIT_REACHED'
}

const getLabel = (
  isLoggedIn,
  isAlreadyFeatured,
  isSaving,
  isErrored,
  isSuccess
) => {
  if (!isLoggedIn) {
    return null
  }

  if (isErrored) {
    return 'Error!'
  }

  if (isSaving) {
    if (isAlreadyFeatured) {
      return 'Unfeaturing...'
    } else {
      return 'Featuring...'
    }
  }

  if (isSuccess) {
    if (isAlreadyFeatured) {
      return 'Unfeatured!'
    } else {
      return 'Featured!'
    }
  }

  if (isAlreadyFeatured) {
    return 'Unfeature'
  }

  return 'Feature'
}

const getIcon = (
  isLoggedIn,
  isLoading,
  isAlreadyFeatured,
  isSaving,
  isErrored,
  isSuccess
) => {
  if (!isLoggedIn) {
    return <StarIcon />
  }

  if (isErrored) {
    return null
  }

  if (isSaving) {
    if (isAlreadyFeatured) {
      return null
    } else {
      return null
    }
  }

  if (isSuccess) {
    return <CheckIcon />
  }

  if (isAlreadyFeatured) {
    return <HighlightOffIcon />
  }

  return <StarIcon />
}

const getErrorMessageForCode = errorCode => {
  switch (errorCode) {
      case FeatureAssetErrorCodes.NOT_ALLOWED:
        return 'You do not have permission'
      case FeatureAssetErrorCodes.NOT_PUBLIC:
        return 'The asset is not public'
      case FeatureAssetErrorCodes.ALREADY_FEATURED:
        return 'The asset is already featured'
      case FeatureAssetErrorCodes.NOT_CREATOR:
        return 'You are not the creator of the asset'
      case FeatureAssetErrorCodes.LIMIT_REACHED:
        return 'Limit has been reached (unfeature others first)'
      default:
        return 'Unknown'
  }
}

export default ({
  assetId,
  featuredStatus = '???',
  onClick = null,
  onDone = null
}) => {
  const userId = useUserId()
  const [isFeaturing, setIsFeaturing] = useState(false)
  const [isFeatureSuccess, setIsFeatureSuccess] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState(null)

  const isLoggedIn = !!userId
  const isAlreadyFeatured = featuredStatus === FeaturedStatuses.Featured

  const toggleFeatured = async () => {
    try {
      if (!isLoggedIn) {
        return
      }

      if (onClick) {
        onClick({
          newValue: true
        })
      }

      setIsFeaturing(true)
      setIsFeatureSuccess(true)
      setLastErrorCode(null)

      const { data: { errorCode }} = await callFunction('featureAsset', {
        assetId
      })

      if (errorCode) {
        setIsFeaturing(false)
        setIsFeatureSuccess(false)
        setLastErrorCode(errorCode)
        return
      }

      setIsFeaturing(false)
      setIsFeatureSuccess(true)
      setLastErrorCode(null)

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to feature asset', err)
      handleError(err)

      setIsFeaturing(false)
      setIsFeatureSuccess(false)
      setLastErrorCode(true)
    }
  }

  const onClickBtn = async () => {
    if (!isLoggedIn) {
      return
    }

    await toggleFeatured()
  }

  return (
    <>
    <Button
      color="default"
      icon={getIcon(
        isLoggedIn,
        isAlreadyFeatured,
        isFeaturing,
        lastErrorCode,
        isFeatureSuccess
      )}
      onClick={onClickBtn}>
      {getLabel(
        isLoggedIn,
        isAlreadyFeatured,
        isFeaturing,
        lastErrorCode,
        isFeatureSuccess
      )}
    </Button>{lastErrorCode ? <>{getErrorMessageForCode(lastErrorCode)}</> : null}
    </>
  )
}
