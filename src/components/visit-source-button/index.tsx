import React from 'react'
import { makeStyles } from '@mui/styles'
import LaunchIcon from '@mui/icons-material/Launch'
import HelpIcon from '@mui/icons-material/Help'

import { handleError } from '../../error-handling'
import { trackAction, trackInternalAction } from '../../analytics'
import { mediaQueryForMobiles } from '../../media-queries'
import * as config from '../../config'
import { SourceInfo } from '../../modules/assets'
import Button from '../button'
import { getIsGitHubUrl, getIsGoogleDriveUrl } from '../../utils'
import useSupabaseClient from '../../hooks/useSupabaseClient'
import { getIsItchProductUrl } from '../../itch'
import { getIsBoothProductUrl } from '../../booth'
import { getIsGumroadProductUrl } from '../../gumroad'
import { getIsJinxxyProductUrl } from '../../jinxxy'
import Price from '../price'
import Tooltip from '../tooltip'
import { CollectionNames as AssetsCollectionNames } from '../../modules/assets'
import { getIsDiscordUrl } from '../../discord'
import { getIsPatreonUrl } from '../../patreon'
import { getIsVrchatAvatarUrl, getIsVrchatWorldUrl } from '../../vrchat'
import { getIsKofiProductUrl } from '../../kofi'
import { getIsPayHipProductUrl } from '../../payhip'

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

  if (getIsVrchatAvatarUrl(sourceUrl)) {
    return 'VRC Avatar'
  }

  if (getIsVrchatWorldUrl(sourceUrl)) {
    return 'VRC World'
  }

  if (getIsPatreonUrl(sourceUrl)) {
    return `Patreon`
  }

  if (getIsDiscordUrl(sourceUrl)) {
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

  if (getIsGoogleDriveUrl(sourceUrl)) {
    return 'Google Drive'
  }

  if (getIsGitHubUrl(sourceUrl)) {
    return `GitHub`
  }

  if (getIsKofiProductUrl(sourceUrl)) {
    return `Ko-Fi`
  }

  if (getIsPayHipProductUrl(sourceUrl)) {
    return `PayHip`
  }

  return 'Source'
}

const addReferrerToUrl = (url: string) => {
  // TODO: Ensure all assets have at least empty string
  if (!url) {
    return ''
  }
  // TODO: Probably re-build URL from scratch
  return `${url}${url.includes('?') ? '' : '?'}&referrer=${encodeURIComponent(
    config.WEBSITE_FULL_URL
  )}`
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
          AssetsCollectionNames.Assets,
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
        color={!isExtraSource ? 'primary' : 'secondary'}
        url={sourceInfo ? addReferrerToUrl(sourceInfo.url) : undefined}
        icon={<LaunchIcon />}
        onClick={onBtnClick}
        size={isLarge ? 'large' : undefined}
        className={`${classes.button} ${
          isExtraSource ? classes.extraSource : ''
        } ${sourceInfo?.price ? classes.buttonWithPrice : ''}`}
        isLoading={isAssetLoading}>
        {sourceInfo?.price !== null && sourceInfo?.price !== undefined ? (
          <Price
            price={sourceInfo?.price}
            priceCurrency={sourceInfo?.pricecurrency!}
            isGreyscale
            className={classes.price}
            small
          />
        ) : null}
        {sourceInfo && sourceInfo.url
          ? getButtonLabel(sourceInfo.url)
          : 'Loading...'}
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
