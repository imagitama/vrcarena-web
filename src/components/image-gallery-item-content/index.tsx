import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { isUrlAYoutubeVideo } from '../../utils'
import YouTubePlayer from '../youtube-player'

const useStyles = makeStyles({
  customContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
  },
  youtubeIcon: {},
})

export default ({
  url,
  index,
  renderer = undefined,
}: {
  url: string
  index: number
  renderer?: React.ComponentType<{ url: string; index: number }>
}) => {
  const classes = useStyles()

  return isUrlAYoutubeVideo(url) ? (
    <div className={classes.customContent}>
      <YouTubePlayer url={url} />
    </div>
  ) : renderer ? (
    <div className={classes.customContent}>
      {React.createElement(renderer, {
        url,
        index,
      })}
    </div>
  ) : // NOTE: Cannot return undefined as it throws React error
  null
}
