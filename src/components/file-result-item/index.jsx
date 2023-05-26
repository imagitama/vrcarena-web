import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { isUrlAnImage, isUrlAVideo, getFilenameFromUrl } from '../../utils'
import VideoPlayer from '../video-player'

const useStyles = makeStyles({
  root: {
    marginRight: '0.5rem'
  },
  image: {
    maxWidth: '500px'
  }
})

export default ({ url }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {isUrlAnImage(url) && (
        <img
          src={url}
          className={classes.image}
          alt="Preview of the attached file"
        />
      )}
      {isUrlAVideo(url) && <VideoPlayer url={url} />}
      <br />
      <a href={url} target="_blank" rel="noopener noreferrer">
        {getFilenameFromUrl(url)}
      </a>
    </div>
  )
}
