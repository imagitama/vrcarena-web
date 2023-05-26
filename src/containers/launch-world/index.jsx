import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { useParams } from 'react-router'

import {
  CollectionNames,
  AssetFieldNames,
  options
} from '../../hooks/useDatabaseQuery'
import { setBannerUrls as setBannerUrlsAction } from '../../modules/app'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import Button from '../../components/button'
import AssetThumbnail from '../../components/asset-thumbnail'
import * as routes from '../../routes'
import { ReactComponent as VRChatIcon } from '../../assets/images/icons/vrchat.svg'
import { trackAction } from '../../analytics'
import useDataStoreItem from '../../hooks/useDataStoreItem'

const useStyles = makeStyles({
  root: {
    textAlign: 'center'
  },
  thumbnail: {
    margin: '2rem 0 3rem'
  },
  vrchatIcon: {
    fontSize: '200%',
    display: 'flex',
    height: 0,
    alignItems: 'center'
  }
})

const getLaunchUrlFromSourceUrl = sourceUrl => {
  const worldId = sourceUrl.split('/').pop()
  // return `https://vrchat.com/home/launch?worldId=${worldId}&instanceId=0`
  return `vrchat://launch?ref=vrchat.com&id=${worldId}:0`
}

const secondsUntilLaunch = 4

const getUrlSearchParams = () =>
  new URLSearchParams(window.location.search.substr(1))

const getAvatarAssetId = () => {
  return getUrlSearchParams().get('avatarId')
}

const analyticsCategory = 'LaunchWorld'

const View = () => {
  const { assetId } = useParams()
  const [isLoading, isErrored, result] = useDataStoreItem(
    CollectionNames.Assets,
    assetId,
    'launch-world'
  )
  const dispatch = useDispatch()
  const setBannerUrls = urls => dispatch(setBannerUrlsAction(urls))
  const unloadBannerOnUnmountRef = useRef(true)
  const [secondsRemaining, setSecondsRemaining] = useState(secondsUntilLaunch)
  const classes = useStyles()
  const launchTimeoutRef = useRef()
  const countdownIntervalRef = useRef()

  useEffect(() => {
    if (!result || !result[AssetFieldNames.bannerUrl]) {
      return
    }

    setBannerUrls({ url: result[AssetFieldNames.bannerUrl] })

    return () => {
      // if switching to edit mode do not unload
      if (unloadBannerOnUnmountRef.current) {
        setBannerUrls({ url: '' })
      }
    }
  }, [result ? result.title : null])

  useEffect(() => {
    if (!result) {
      return
    }

    launchTimeoutRef.current = setTimeout(() => {
      window.location.href = getLaunchUrlFromSourceUrl(
        result[AssetFieldNames.sourceUrl]
      )
    }, secondsUntilLaunch * 1000)

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining(currentVal => {
        if (currentVal > 0) {
          return currentVal - 1
        } else {
          clearInterval(countdownIntervalRef.current)
          return 0
        }
      })
    }, 1000)

    return () => {
      clearTimeout(launchTimeoutRef.current)
      clearInterval(countdownIntervalRef.current)
    }
  }, [result ? result.title : null])

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored || result === null) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  const originalAvatarAssetId = getAvatarAssetId()

  return (
    <div className={classes.root}>
      <Heading variant="h1">
        Launch world "{result[AssetFieldNames.title]}"
      </Heading>
      <AssetThumbnail
        url={result[AssetFieldNames.thumbnailUrl]}
        className={classes.thumbnail}
        spin
        pauseOnHover={false}
      />
      <Heading variant="h2">
        {secondsRemaining > 0
          ? `Opening the world in your VRChat client in ${secondsRemaining} seconds...`
          : 'Opened in your VRChat client'}
      </Heading>
      <>
        <Button
          url={getLaunchUrlFromSourceUrl(result[AssetFieldNames.sourceUrl])}
          onClick={() =>
            trackAction(analyticsCategory, 'Click go now button', assetId)
          }
          icon={
            <span className={classes.vrchatIcon}>
              <VRChatIcon />
            </span>
          }>
          Go Now
        </Button>{' '}
        {originalAvatarAssetId && (
          <Button
            color="default"
            url={routes.viewAssetWithVar.replace(':assetId', assetId)}
            onClick={() =>
              trackAction(analyticsCategory, 'Click view world button', assetId)
            }>
            View World
          </Button>
        )}{' '}
        <Button
          color="default"
          url={routes.viewAssetWithVar.replace(
            ':assetId',
            originalAvatarAssetId || assetId
          )}
          onClick={() =>
            trackAction(
              analyticsCategory,
              originalAvatarAssetId
                ? 'Click back to avatar button'
                : 'Click back to world button',
              originalAvatarAssetId || assetId
            )
          }>
          {originalAvatarAssetId ? 'Back to Avatar' : 'Back to World'}
        </Button>
      </>
    </div>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Launch VRChat world | VRCArena</title>
      <meta name="description" content="Open VRChat to a world for an asset." />
    </Helmet>
    <View />
  </>
)
