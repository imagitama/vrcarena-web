import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import VideoPlayer from '../../../video-player'
import YouTubePlayer from '../../../youtube-player'
import { trackAction } from '../../../../analytics'
import { isUrlAYoutubeVideo } from '../../../../utils'

const useStyles = makeStyles({
  video: {
    width: '480px',
    height: '320px',
    overflow: 'hidden', // fix embeds floating out
    margin: '0 0.5rem 0.5rem 0',
    background: 'rgba(0, 0, 0, 0.2)'
  },
  youtube: {
    width: '320px',
    height: '180px'
  }
})

const analyticsCategoryName = 'ViewAsset'

export default ({ assetId, urls }) => {
  const classes = useStyles()

  return (
    <div>
      {urls.map(url => {
        const onPlay = () =>
          trackAction(analyticsCategoryName, 'Play attached video', {
            assetId,
            url
          })
        return (
          <div
            key={url}
            className={`${classes.video} ${
              isUrlAYoutubeVideo(url) ? classes.youtube : ''
            }`}>
            {isUrlAYoutubeVideo(url) ? (
              <YouTubePlayer url={url} width="100%" onPlay={onPlay} />
            ) : (
              <VideoPlayer url={url} onPlay={onPlay} width={480} height={320} />
            )}
          </div>
        )
      })}
    </div>
  )
}
