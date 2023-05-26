import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PlaylistResultsItem from '../playlist-results-item'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' }
})

export default ({ playlists }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {playlists.map(playlist => (
        <PlaylistResultsItem key={playlist.id} playlist={playlist} />
      ))}
    </div>
  )
}
