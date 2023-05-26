import React from 'react'
import YouTubePlayer from 'react-player/youtube'
import { makeStyles } from '@material-ui/core/styles'

import {
  isUrlAYoutubeVideo,
  isUrlATweet,
  isUrlAnImage,
  isUrlAVideo
} from '../../utils'
import VideoPlayer from '../video-player'
import Tweet from '../tweet'
import { trackAction } from '../../analytics'

const getImageUrlFromUrls = (fileUrls: string[]): string | undefined =>
  fileUrls.find(url => isUrlAnImage(url))

const getVideoUrlFromUrls = (fileUrls: string[]): string | undefined =>
  fileUrls.find(url => isUrlAVideo(url))

const useStyles = makeStyles({
  small: {
    width: '400px'
  }
})

export default ({
  assetId,
  fileUrls,
  sourceUrl,
  analyticsCategoryName,
  isSmall = false
}: {
  assetId: string
  fileUrls: string[]
  sourceUrl: string
  analyticsCategoryName: string
  isSmall?: boolean
}) => {
  const attachedImageUrl = getImageUrlFromUrls(fileUrls)
  const classes = useStyles()

  if (attachedImageUrl) {
    return (
      <img
        src={attachedImageUrl}
        alt="Content"
        className={isSmall ? classes.small : ''}
      />
    )
  }

  const attachedVideoUrl = getVideoUrlFromUrls(fileUrls)

  if (attachedVideoUrl) {
    return <VideoPlayer url={attachedVideoUrl} />
  }

  if (isUrlAYoutubeVideo(sourceUrl)) {
    return (
      <YouTubePlayer
        url={sourceUrl}
        width="100%"
        onPlay={() =>
          trackAction(
            analyticsCategoryName,
            'Click play youtube video for asset',
            assetId
          )
        }
      />
    )
  }

  if (isUrlATweet(sourceUrl)) {
    // @ts-ignore
    return <Tweet url={sourceUrl} />
  }

  return 'No image/video or URL provided'
}
