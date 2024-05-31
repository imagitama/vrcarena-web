import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LaunchIcon from '@material-ui/icons/Launch'

import { handleError } from '../../error-handling'
import { trackAction, trackInternalAction } from '../../analytics'
import { mediaQueryForMobiles } from '../../media-queries'
import { CollectionNames as OldCollectionNames } from '../../hooks/useDatabaseQuery'
import * as config from '../../config'
import { SourceInfo } from '../../modules/assets'
import Button from '../button'
import {
  isBoothUrl,
  isGitHubUrl,
  isGumroadUrl,
  isTwitterUrl,
  isVrchatAvatarUrl,
  isVrchatWorldUrl,
  isDiscordUrl,
  isGoogleDriveUrl,
  isPatreonUrl,
} from '../../utils'
import { formatPrice } from '../../currency'

const useStyles = makeStyles({
  button: {
    [mediaQueryForMobiles]: {
      width: '100%',
    },
  },
  extraSource: {
    display: 'block',
    marginTop: '0.25rem',
  },
  comments: {
    fontSize: '75%',
    padding: '0.1rem',
  },
})

function getButtonLabel(
  sourceUrl: string | undefined,
  isExtraSource: boolean
): string {
  if (!sourceUrl) {
    return '(no source URL)'
  }

  const prefix = isExtraSource ? 'Also On' : 'Get From'

  if (isGumroadUrl(sourceUrl)) {
    return `${prefix} Gumroad`
  }

  if (isTwitterUrl(sourceUrl)) {
    return 'View Source Tweet'
  }

  if (isVrchatAvatarUrl(sourceUrl)) {
    return 'View VRChat Avatar'
  }

  if (isVrchatWorldUrl(sourceUrl)) {
    return 'View VRChat World'
  }

  if (isPatreonUrl(sourceUrl)) {
    return `${prefix} Patreon`
  }

  if (isDiscordUrl(sourceUrl)) {
    return `${prefix} Discord`
  }

  if (isBoothUrl(sourceUrl)) {
    return `${prefix} Booth`
  }

  if (isGoogleDriveUrl(sourceUrl)) {
    return 'Download from Google Drive'
  }

  if (isGitHubUrl(sourceUrl)) {
    return `${prefix} GitHub`
  }

  return isExtraSource ? 'View Other Source' : 'Visit Source'
}

const addReferrerToGumroadUrl = (url: string) => {
  if (url && isGumroadUrl(url)) {
    // TODO: Probably re-build URL from scratch
    return `${url}${url.includes('?') ? '' : '?'}&referrer=${encodeURIComponent(
      config.WEBSITE_FULL_URL
    )}`
  }
  return url
}

const VisitSourceButton = ({
  sourceInfo,
  isAssetLoading = false,
  assetId,
  isLarge = false,
  onClick,
  analyticsCategoryName,
  analyticsEvent,
  extraSources,
  isExtraSource = false,
}: {
  sourceInfo?: SourceInfo
  assetId?: string
  analyticsCategoryName?: string
  analyticsEvent?: string
  isLarge?: boolean
  isAssetLoading?: boolean
  sourceUrl?: string
  onClick?: (payload: { assetId?: string; sourceUrl: string }) => void
  extraSources?: SourceInfo[]
  isExtraSource?: boolean
}) => {
  const classes = useStyles()

  const onBtnClick = async () => {
    try {
      if (!sourceInfo) {
        return
      }

      if (onClick) {
        onClick({
          assetId,
          sourceUrl: sourceInfo.url,
        })
      }

      if (analyticsCategoryName) {
        trackAction(
          analyticsCategoryName,
          analyticsEvent || 'Click visit source button',
          { url: sourceInfo.url, assetId }
        )
        trackInternalAction(
          analyticsCategoryName,
          analyticsEvent || 'Click visit source button',
          OldCollectionNames.Assets,
          assetId || '',
          { url: sourceInfo.url }
        )
      }
    } catch (err) {
      console.error('Failed to save to database', err)
      handleError(err)
    }
  }

  return (
    <>
      <Button
        color={!isExtraSource ? 'primary' : 'default'}
        url={sourceInfo ? addReferrerToGumroadUrl(sourceInfo.url) : undefined}
        icon={<LaunchIcon />}
        onClick={onBtnClick}
        size={isLarge ? 'large' : undefined}
        className={`${classes.button} ${
          isExtraSource ? classes.extraSource : ''
        }`}
        isLoading={isAssetLoading}>
        {getButtonLabel(sourceInfo?.url, isExtraSource)}
      </Button>
      {sourceInfo?.comments || sourceInfo?.price ? (
        <div className={classes.comments}>
          {sourceInfo.comments}
          {sourceInfo?.price && sourceInfo.pricecurrency
            ? `${sourceInfo.comments ? ' - ' : ''}${formatPrice(
                sourceInfo.price,
                sourceInfo.pricecurrency
              )}`
            : ''}
        </div>
      ) : null}
    </>
  )
}

export default VisitSourceButton
