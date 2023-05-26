import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ReactTwitchEmbedVideo from 'react-twitch-embed-video'
import Link from '../../components/link'

import * as routes from '../../routes'
import Button from '../button'
import { trackAction } from '../../analytics'
import { UserFieldNames } from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  root: {
    padding: '1rem'
  },
  inner: {
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '3px'
  },
  twitchUsername: {
    fontSize: '150%',
    padding: '0.5rem'
  },
  videoArea: {
    width: '100%',
    minHeight: '200px',
    background: '#000',
    position: 'relative'
  },
  watchBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  stopWatchingBtn: {
    margin: '0.25rem'
  }
})

export default ({
  user: { id: userId, [UserFieldNames.twitchUsername]: twitchUsername }
}) => {
  const classes = useStyles()
  const [isStreamEnabled, setIsStreamEnabled] = useState(false)

  return (
    <div className={classes.root}>
      <div className={classes.inner}>
        <div className={classes.twitchUsername}>
          <a href={`https://twitch.tv/${twitchUsername}`}>{twitchUsername}</a> (
          <Link to={routes.viewUserWithVar.replace(':userId', userId)}>
            user
          </Link>
          )
        </div>

        <div className={classes.videoArea}>
          {isStreamEnabled ? (
            <div>
              <ReactTwitchEmbedVideo
                channel={twitchUsername}
                targetId={`twitch-embed-${twitchUsername}`}
                width="100%"
                layout="video"
                onPlay={() =>
                  trackAction(
                    'Streams',
                    'Click play stream button',
                    twitchUsername
                  )
                }
              />
              <Button
                size="small"
                className={classes.stopWatchingBtn}
                onClick={() => setIsStreamEnabled(false)}>
                Stop Watching
              </Button>
            </div>
          ) : (
            <Button
              className={classes.watchBtn}
              onClick={() => setIsStreamEnabled(true)}>
              Watch
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
