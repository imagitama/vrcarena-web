import React from 'react'
import StarIcon from '@mui/icons-material/Star'
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

const FeatureButton = ({
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
  const [isLoading, lastErrorCode, result, performCall] = useFirebaseFunction<
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
      {lastErrorCode !== null ? (
        <ErrorMessage>
          Failed to toggle feature (code {lastErrorCode})
        </ErrorMessage>
      ) : null}
      <Button
        color="secondary"
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

export default FeatureButton
