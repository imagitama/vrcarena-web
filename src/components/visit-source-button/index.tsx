import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LaunchIcon from '@material-ui/icons/Launch'
import HelpIcon from '@material-ui/icons/Help'

import { handleError } from '../../error-handling'
import { trackAction, trackInternalAction } from '../../analytics'
import { mediaQueryForMobiles } from '../../media-queries'
import { CollectionNames as OldCollectionNames } from '../../hooks/useDatabaseQuery'
import * as config from '../../config'
import { SourceInfo } from '../../modules/assets'
import Button from '../button'
import {
  isGitHubUrl,
  isTwitterUrl,
  isVrchatAvatarUrl,
  isVrchatWorldUrl,
  isDiscordUrl,
  isGoogleDriveUrl,
  isPatreonUrl,
} from '../../utils'
import useSupabaseClient from '../../hooks/useSupabaseClient'
import { getIsItchProductUrl } from '../../itch'
import { getIsBoothProductUrl } from '../../booth'
import { getIsGumroadProductUrl } from '../../gumroad'
import { getIsJinxxyProductUrl } from '../../jinxxy'
import Price from '../price'
import Tooltip from '../tooltip'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  button: {
    [mediaQueryForMobiles]: {
      width: '100%',
    },
  },
  buttonWithPrice: {
    '& > *': {
      paddingLeft: '7.5px',
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
  price: {
    marginRight: '10px',
  },
  icon: {
    margin: '5px 0 0 5px',
    opacity: 0.5, // same as "HintText"
  },
})

function getButtonLabel(sourceUrl: string): string {
  if (getIsGumroadProductUrl(sourceUrl)) {
    return `Gumroad`
  }

  if (isTwitterUrl(sourceUrl)) {
    return 'Tweet'
  }

  if (isVrchatAvatarUrl(sourceUrl)) {
    return 'VRC Avatar'
  }

  if (isVrchatWorldUrl(sourceUrl)) {
    return 'VRC World'
  }

  if (isPatreonUrl(sourceUrl)) {
    return `Patreon`
  }

  if (isDiscordUrl(sourceUrl)) {
    return `Discord`
  }

  if (getIsBoothProductUrl(sourceUrl)) {
    return `Booth`
  }

  if (getIsItchProductUrl(sourceUrl)) {
    return `itch.io`
  }

  if (getIsJinxxyProductUrl(sourceUrl)) {
    return `Jinxxy`
  }

  if (isGoogleDriveUrl(sourceUrl)) {
    return 'Google Drive'
  }

  if (isGitHubUrl(sourceUrl)) {
    return `GitHub`
  }

  return 'Source'
}

const addReferrerToGumroadUrl = (url: string) => {
  if (url && getIsGumroadProductUrl(url)) {
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
  isExtraSource = false,
}: {
  sourceInfo?: SourceInfo
  assetId?: string
  analyticsCategoryName?: string
  analyticsEvent?: string
  isLarge?: boolean
  isAssetLoading?: boolean
  onClick?: (payload: { assetId?: string; sourceUrl: string }) => void
  isExtraSource?: boolean
}) => {
  const classes = useStyles()
  const supabase = useSupabaseClient()

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
          supabase,
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
    <div className={classes.root}>
      <Button
        color={!isExtraSource ? 'primary' : 'default'}
        url={sourceInfo ? addReferrerToGumroadUrl(sourceInfo.url) : undefined}
        icon={<LaunchIcon />}
        onClick={onBtnClick}
        size={isLarge ? 'large' : undefined}
        className={`${classes.button} ${
          isExtraSource ? classes.extraSource : ''
        } ${sourceInfo?.price ? classes.buttonWithPrice : ''}`}
        isLoading={isAssetLoading}>
        {sourceInfo?.price ? (
          <Price
            price={sourceInfo?.price}
            priceCurrency={sourceInfo?.pricecurrency!}
            isGreyscale
            className={classes.price}
            small
          />
        ) : null}
        {sourceInfo ? getButtonLabel(sourceInfo?.url) : 'Loading...'}
      </Button>
      {sourceInfo?.comments && (
        <Tooltip title={sourceInfo?.comments}>
          <HelpIcon className={classes.icon} />
        </Tooltip>
      )}
    </div>
  )
}

export default VisitSourceButton
