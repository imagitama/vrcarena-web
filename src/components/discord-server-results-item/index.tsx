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
import DefaultAvatar from '../default-avatar'
import { DiscordServer } from '../../modules/discordservers'

const useStyles = makeStyles({
  root: {
    width: '200px',
    margin: '0.5rem',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
      margin: '0.25rem',
    },
  },
  media: {
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px',
    },
  },
  content: {
    '&, &:last-child': {
      padding: 16,
    },
  },
  cats: {
    marginTop: '0.35rem',
  },
})

const DiscordServerResultsItem = ({
  discordServer: { id, name, iconurl },
  onClick,
}: {
  discordServer: DiscordServer
  onClick?: (e: any) => void
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Card>
        <CardActionArea>
          <Link
            to={routes.viewDiscordServerWithVar.replace(':discordServerId', id)}
            onClick={onClick}>
            <CardMedia
              className={classes.media}
              image={iconurl}
              title={`Thumbnail for ${name}`}>
              {!iconurl && <DefaultAvatar stringForDecision={name} />}
            </CardMedia>
            <CardContent className={classes.content}>
              <Typography variant="h5" component="h2">
                {name}
              </Typography>
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    </div>
  )
}

export default DiscordServerResultsItem
