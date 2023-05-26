import React from 'react'
import LazyLoad from 'react-lazyload'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import Chip from '@material-ui/core/Chip'

import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import FormattedDate from '../formatted-date'
import defaultAvatarImageUrl from '../../assets/images/default-avatar.png'
import useVrchatWorld from '../../hooks/useVrchatWorld'
import Button from '../button'

const chipMargin = '0.25rem'

const useStyles = makeStyles(theme => ({
  root: {
    width: '200px',
    margin: '0.5rem',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
      margin: '0.25rem'
    },
    overflow: 'visible'
  },
  media: {
    height: '200px'
  },
  chips: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: chipMargin
  },
  chip: {
    cursor: 'pointer',
    marginLeft: chipMargin
  },
  date: {
    margin: '0.25rem 0 0.5rem',
    color: theme.palette.text.secondary
  },
  icon: {
    '& svg': {
      fontSize: '1rem'
    }
  }
}))

// world: https://vrchatapi.github.io/docs/api/#get-/worlds/-worldId-

// TODO: Move to common place
const viewVrchatWorldUrlWithVar = 'https://vrchat.com/home/world/:worldId'

// TODO: Move to common place
const getDateFromVrchatApiDate = vrchatApiDate => new Date(vrchatApiDate)

// TODO: Move to common place
const getIsQuestCompatible = unityPackages =>
  unityPackages.find(({ platform }) => platform === 'android')
const getIsPcCompatible = unityPackages =>
  unityPackages.find(({ platform }) => platform === 'standalonewindows')

export default ({ worldId, worldData, showControls = false }) => {
  const [isFetching, isError, newerData, hydrate] = useVrchatWorld(
    worldId,
    false
  )
  const {
    id,
    thumbnailImageUrl,
    name,
    authorName,
    created_at,
    updated_at,
    description,
    release_status,
    unityPackages = []
  } = newerData || worldData || {}

  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <CardActionArea>
        <a
          href={viewVrchatWorldUrlWithVar.replace(':worldId', worldId)}
          target="_blank"
          rel="noopener noreferrer">
          <div className={classes.chips}>
            {getIsQuestCompatible(unityPackages) && (
              <Chip label="Quest" className={classes.chip} />
            )}
            {getIsPcCompatible(unityPackages) && (
              <Chip label="PC" className={classes.chip} />
            )}
          </div>
          <LazyLoad width={200} height={200}>
            <CardMedia
              image={thumbnailImageUrl || defaultAvatarImageUrl}
              className={classes.media}
            />
          </LazyLoad>
          <CardContent>
            <Typography variant="h5" component="h2">
              {name || worldId}{' '}
              <span className={classes.icon}>
                <OpenInNewIcon />
              </span>
            </Typography>
            {created_at && (
              <div className={classes.date}>
                <FormattedDate date={getDateFromVrchatApiDate(created_at)} />
              </div>
            )}
            <Typography variant="body2" color="textSecondary" component="p">
              {description}
            </Typography>
            {showControls && (
              <Button
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  hydrate()
                  return false
                }}
                disabled={isFetching}>
                {isFetching
                  ? 'Fetching...'
                  : isError
                  ? 'Failed to fetch!'
                  : 'Fetch'}
              </Button>
            )}
          </CardContent>
        </a>
      </CardActionArea>
    </Card>
  )
}
