import React from 'react'
import StarIcon from '@material-ui/icons/Star'
import Button from '../button'
import { handleError } from '../../error-handling'
import { FeaturedStatus, MetaRecord } from '../../modules/common'
import useFirebaseFunction from '../../hooks/useFirebaseFunction'
import ErrorMessage from '../error-message'
import useIsPatron from '../../hooks/useIsPatron'

enum FeatureAssetErrorCodes {
  NOT_ALLOWED = 'NOT_ALLOWED',
  NOT_PUBLIC = 'NOT_PUBLIC',
  ALREADY_FEATURED = 'ALREADY_FEATURED',
  NOT_CREATOR = 'NOT_CREATOR',
  LIMIT_REACHED = 'LIMIT_REACHED',
}

interface FeatureAssetPayload {
  assetId: string
}

interface FeatureAssetResult {
  isFeatured?: boolean
  errorCode?: FeatureAssetErrorCodes
}

export default ({
  id,
  existingFeaturedStatus = undefined,
  onClick = undefined,
  onDone = undefined,
}: {
  id: string
  existingFeaturedStatus?: FeaturedStatus
  onClick?: ({ newValue }: { newValue: FeaturedStatus }) => void
  onDone?: () => void
}) => {
  const isPatron = useIsPatron()
  const [isLoading, isErrored, result, performCall] = useFirebaseFunction<
    FeatureAssetPayload,
    FeatureAssetResult
  >('featureAsset')

  const isCurrentlyFeatured =
    result !== null && result.isFeatured !== undefined
      ? result.isFeatured
      : existingFeaturedStatus === FeaturedStatus.Featured

  const toggleFeatured = async () => {
    try {
      await performCall({
        assetId: id,
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (!isPatron) {
    return null
  }

  return (
    <>
      {isErrored ? <ErrorMessage>Failed to toggle feature</ErrorMessage> : null}
      <Button
        color="default"
        onClick={() => toggleFeatured()}
        icon={<StarIcon />}
        isDisabled={isLoading}>
        {isLoading
          ? 'Working...'
          : isCurrentlyFeatured
          ? 'Unfeature'
          : 'Feature'}
      </Button>
    </>
  )
}
