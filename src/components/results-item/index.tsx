import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import LazyLoad from 'react-lazyload'
import LoyaltyIcon from '@material-ui/icons/Loyalty'
// import LinkIcon from '@material-ui/icons/Link'
// import EditIcon from '@material-ui/icons/Edit'

import Link from '../link'
// import LoadingShimmer from '../loading-shimmer'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import DefaultThumbnail from '../default-thumbnail'

const useStyles = makeStyles({
  root: {
    width: '200px',
    transition: 'all 100ms',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
    },
    '& a': {
      color: 'inherit',
    },
    '&:hover $relation svg': {
      transform: 'rotate(360deg) !important',
    },
  },
  tiny: {
    width: '100%',
    fontSize: '75%',
    '& $cardMedia': {
      width: '100px',
      height: '100px',
    },
    '& $cardContent': {
      padding: '5px',
    },
    '& a': {
      display: 'flex',
    },
  },
  button: {
    font: 'inherit',
  },
  selected: {
    backgroundColor: '#656565',
  },
  dimmed: {
    opacity: 0.5,
  },
  // overrides
  cardContent: {
    overflow: 'hidden', // for tiny clipping
    padding: '12px',
    '&:last-child': {
      paddingBottom: '12px',
    },
  },
  cardMedia: {
    transition: 'all 500ms',
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px',
    },
    overflow: 'hidden', // fix onClick in controls not working
  },
  // parts
  title: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.15em',
    '& span': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '& svg': {
      marginLeft: '2px',
      fontSize: '0.8em',
    },
  },
  author: {
    fontSize: '0.85em',
    marginBottom: '6px',
  },
  microText: {
    fontSize: '0.85em',
    textTransform: 'uppercase',
    lineHeight: '1.25',
    height: '16px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#C9C9C9',
  },
  moreInfo: {
    marginTop: '6px',
    display: 'flex',
  },
  controls: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  control: {
    padding: 0,
    marginRight: '0.25rem',
    opacity: '0.5',
    transition: '100ms all',
    filter: 'drop-shadow(1px 1px 1px #000)',
    '&:hover': {
      opacity: 1,
    },
  },
})

const ResultsItem = ({
  linkUrl,
  title,
  thumbnailUrl,
  isadult,
  createdbyusername,
  //   createdbyid,
  description,
  // settings
  isSelected,
  isDimmed,
  isTiny,
}: {
  linkUrl?: string
  title?: string
  thumbnailUrl?: string
  isadult?: boolean
  createdbyusername?: string
  // createdbyid?: string
  description?: string
  // settings
  isSelected?: boolean
  isDimmed?: boolean
  isTiny?: boolean
}) => {
  const classes = useStyles()
  return (
    <Card
      className={`${classes.root} ${isSelected ? classes.selected : ''} ${
        isDimmed ? classes.dimmed : ''
      } ${isTiny ? classes.tiny : ''}`}>
      <CardActionArea className={classes.button}>
        <Link to={linkUrl}>
          <LazyLoad height={200} placeholder={<DefaultThumbnail />}>
            <CardMedia
              className={classes.cardMedia}
              image={thumbnailUrl || ''}
              title={`Thumbnail for ${title || ''}`}>
              {thumbnailUrl ? undefined : <DefaultThumbnail />}
            </CardMedia>
          </LazyLoad>
          <CardContent className={classes.cardContent}>
            <div className={classes.title}>
              <span title={(title || '').trim()}>{(title || '').trim()}</span>
              {isadult ? <LoyaltyIcon /> : null}
            </div>
            {createdbyusername ? (
              <div className={classes.author}>by {createdbyusername}</div>
            ) : null}
            <div className={classes.microText}>{description}</div>
          </CardContent>
        </Link>
      </CardActionArea>
    </Card>
  )
}

export default ResultsItem
