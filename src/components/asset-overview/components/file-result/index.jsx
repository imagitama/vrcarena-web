import React, { useState } from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import GetAppIcon from '@material-ui/icons/GetApp'

import Button from '../../../button'
import VideoPlayer from '../../../video-player'
import FbxViewer from '../../../fbx-viewer'
import { trackAction } from '../../../../analytics'
import {
  getFilenameFromUrl,
  isUrlAnImage,
  isUrlAVideo,
  isUrlAFbx
} from '../../../../utils'

const useStyles = makeStyles({
  root: { padding: '1rem', marginBottom: '1rem' },
  imageThumbnail: { width: '100%', maxWidth: '500px' }
})

const analyticsCategoryName = 'ViewAsset'

export default ({ assetId, url }) => {
  const classes = useStyles()
  const [showFbxViewer, setShowFbxViewer] = useState(false)

  if (!url) {
    return null
  }

  return (
    <Paper className={classes.root}>
      {getFilenameFromUrl(url)}
      <br />
      {isUrlAnImage(url) ? (
        <img
          src={url}
          className={classes.imageThumbnail}
          alt="Thumbnail for file"
        />
      ) : isUrlAVideo(url) ? (
        <VideoPlayer
          url={url}
          onPlay={() =>
            trackAction(analyticsCategoryName, 'Play attached video', {
              assetId,
              url
            })
          }
        />
      ) : (
        <>
          {isUrlAFbx(url) && showFbxViewer && (
            <FbxViewer
              url={url}
              onClick={() =>
                trackAction(analyticsCategoryName, 'Click on FBX viewer', {
                  assetId,
                  url
                })
              }
            />
          )}
          {isUrlAFbx(url) && !showFbxViewer && (
            <>
              <Button
                onClick={() => {
                  setShowFbxViewer(true)
                  trackAction(analyticsCategoryName, 'Click view FBX button', {
                    assetId,
                    url
                  })
                }}
                color="default">
                Preview .fbx
              </Button>{' '}
            </>
          )}
          <Button
            className={classes.downloadButton}
            url={url}
            icon={<GetAppIcon />}
            onClick={() =>
              trackAction(
                analyticsCategoryName,
                'Click download attached file',
                {
                  assetId,
                  url
                }
              )
            }>
            Download
          </Button>
        </>
      )}
    </Paper>
  )
}
