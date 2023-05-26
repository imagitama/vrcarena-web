import React from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import CardMedia from '@material-ui/core/CardMedia'

import * as routes from '../../routes'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import defaultAvatarUrl from '../../assets/images/default-avatar.png'
import { PlaylistsFieldNames } from '../../data-store'

const useStyles = makeStyles({
  root: {
    width: '200px',
    margin: '0.5rem',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
      margin: '0.25rem'
    }
  },
  media: {
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px'
    }
  },
  content: {
    '&, &:last-child': {
      padding: 16
    }
  },
  cats: {
    marginTop: '0.35rem'
  }
})

// TODO: Use field name constants
export default ({
  playlist: {
    id,
    [PlaylistsFieldNames.title]: title,
    [PlaylistsFieldNames.thumbnailUrl]: thumbnailUrl,
    [PlaylistsFieldNames.items]: items = []
  }
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Card>
        <CardActionArea>
          <Link to={routes.viewPlaylistWithVar.replace(':playlistId', id)}>
            <CardMedia
              className={classes.media}
              image={thumbnailUrl || defaultAvatarUrl}
              title={`Thumbnail for ${title}`}
            />
            <CardContent className={classes.content}>
              <Typography variant="h5" component="h2">
                {title} ({items ? items.length : '0'})
              </Typography>
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    </div>
  )
}
