import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LaunchIcon from '@material-ui/icons/Launch'

import { handleError } from '../../error-handling'
import { trackAction, trackInternalAction } from '../../analytics'
import { mediaQueryForMobiles } from '../../media-queries'

import { CollectionNames as OldCollectionNames } from '../../hooks/useDatabaseQuery'

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
  isPatreonUrl
} from '../../utils'

const useStyles = makeStyles({
  button: {
    [mediaQueryForMobiles]: {
      width: '100%'
    }
  }
})

function getButtonLabel(category, sourceUrl, isNoFilesAttached) {
  if (!sourceUrl) {
    return 'No source URL'
  }

  if (!isNoFilesAttached) {
    return 'Visit Source'
  }

  if (isGumroadUrl(sourceUrl)) {
    return 'Get from Gumroad'
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
    return 'Get from Patreon'
  }

  if (isDiscordUrl(sourceUrl)) {
    return 'Get from Discord'
  }

  if (isBoothUrl(sourceUrl)) {
    return 'Get from Booth'
  }

  if (isGoogleDriveUrl(sourceUrl)) {
    return 'Download from Google Drive'
  }

  if (isGitHubUrl(sourceUrl)) {
    return 'Get from GitHub'
  }

  return 'Visit Source'
}

const addReferrerToGumroadUrl = url => {
  if (url && isGumroadUrl(url)) {
    // TODO: Probably re-build URL from scratch
    return `${url}${url.includes('?') ? '' : '?'}&referrer=${
      config.WEBSITE_FULL_URL
    }`
  }
  return url
}

export default ({
  isAssetLoading,
  assetId,
  sourceUrl,
  categoryName,
  isNoFilesAttached = false,
  isLarge = false,
  onClick = null,
  analyticsCategoryName = '',
  analyticsEvent = ''
}) => {
  const classes = useStyles()

  const onBtnClick = async () => {
    try {
      if (!sourceUrl) {
        return
      }

      if (onClick) {
        onClick({
          assetId,
          sourceUrl
        })
      }

      if (analyticsCategoryName) {
        trackAction(
          analyticsCategoryName,
          analyticsEvent || 'Click visit source button',
          { url: sourceUrl, assetId }
        )
        trackInternalAction(
          analyticsCategoryName,
          analyticsEvent || 'Click visit source button',
          OldCollectionNames.Assets,
          assetId,
          { url: sourceUrl }
        )
      }
    } catch (err) {
      console.error('Failed to save to database', err)
      handleError(err)
    }
  }

  return (
    <Button
      color={isNoFilesAttached ? 'primary' : 'default'}
      url={addReferrerToGumroadUrl(sourceUrl)}
      icon={<LaunchIcon />}
      onClick={onBtnClick}
      size={isLarge ? 'large' : undefined}
      className={classes.button}
      isLoading={isAssetLoading}>
      {getButtonLabel(categoryName, sourceUrl, isNoFilesAttached)}
    </Button>
  )
}
