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
import { EventsFieldNames } from '../../data-store'
import FormattedDate from '../formatted-date'

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

export default ({
  event: {
    id,
    [EventsFieldNames.name]: name,
    [EventsFieldNames.thumbnailUrl]: thumbnailUrl,
    [EventsFieldNames.startsAt]: startsAt
  }
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Card>
        <CardActionArea>
          <Link to={routes.viewEventWithVar.replace(':eventId', id)}>
            <CardMedia
              className={classes.media}
              image={thumbnailUrl || defaultAvatarUrl}
              title={`Thumbnail for ${name}`}
            />
            <CardContent className={classes.content}>
              <Typography variant="h5" component="h2">
                {name}
              </Typography>
              <FormattedDate date={startsAt} />
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    </div>
  )
}
