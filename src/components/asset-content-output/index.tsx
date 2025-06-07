import React from 'react'
import YouTubePlayer from 'react-player/youtube'
import { makeStyles } from '@material-ui/core/styles'

import {
  getIsUrlAYoutubeVideo,
  getIsUrlAnImage,
  getIsUrlAVideo,
} from '../../utils'
import VideoPlayer from '../video-player'
import { trackAction } from '../../analytics'

const getImageUrlFromUrls = (fileUrls: string[]): string | undefined =>
  fileUrls.find((url) => getIsUrlAnImage(url))

const getVideoUrlFromUrls = (fileUrls: string[]): string | undefined =>
  fileUrls.find((url) => getIsUrlAVideo(url))

const useStyles = makeStyles({
  small: {
    width: '400px',
  },
})

export default ({
  assetId,
  fileUrls,
  sourceUrl,
  analyticsCategoryName,
  isSmall = false,
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

  if (getIsUrlAYoutubeVideo(sourceUrl)) {
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

  return 'No image/video or URL provided'
}
