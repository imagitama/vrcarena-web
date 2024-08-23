import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import LazyLoad from 'react-lazyload'
import LoyaltyIcon from '@material-ui/icons/Loyalty'
import LinkIcon from '@material-ui/icons/Link'

import * as routes from '../../routes'
import {
  Asset,
  PublicAsset,
  Relation,
  getIsPublicAsset,
} from '../../modules/assets'
import Link from '../link'
import useUserPreferences from '../../hooks/useUserPreferences'
import { getCategoryMeta } from '../../category-meta'
import Price from '../price'
import LoadingShimmer from '../loading-shimmer'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import AddToCartButton from '../add-to-cart-button'
import DefaultThumbnail from '../default-thumbnail'
import { AssetSearchResult } from '../../hooks/useAlgoliaSearch'

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
    }
  },
  selected: {
    backgroundColor: '#656565',
  },
  dimmed: {
    opacity: 0.5,
  },
  // overrides
  cardContent: {
    padding: '12px !important', // also fixes last-child padding
  },
  cardMedia: {
    transition: 'all 500ms',
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px',
    },
  },
  // parts
  title: {
    display: 'flex',
    alignItems: 'center',
    '& span': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: '1rem',
    },
    '& svg': {
      marginLeft: '2px',
      fontSize: '80%',
    },
  },
  author: {
    fontSize: '90%',
    marginBottom: '6px',
  },
  microText: {
    fontSize: '85%',
    textTransform: 'uppercase',
    lineHeight: '1.25',
    height: '16px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#C9C9C9',
  },
  relation: {
    display: 'inline-flex',
    alignItems: 'center',
    '& svg': {
      fontSize: '100%',
      transform: 'rotate(90deg)',
      transition: 'transform 500ms',
    },
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

const divider = '/'

const SpeciesOutput = ({
  asset,
  relation,
}: {
  asset?: Asset | PublicAsset | AssetSearchResult
  relation?: Relation
}) => {
  const classes = useStyles()

  if (relation) {
    return (
      <span className={classes.relation}>
        {divider} {relation.type} <LinkIcon />
      </span>
    )
  }

  if (!asset) {
    return (
      <>
        {divider} <LoadingShimmer width="30px" height="10px" />,{' '}
        <LoadingShimmer width="45px" height="10px" />
      </>
    )
  }

  if (!asset.species || !asset.species.length) {
    return null
  }

  if ('speciesnames' in asset) {
    return (
      <>
        {divider} {asset.speciesnames.join(', ')}
      </>
    )
  }

  return (
    <>
      {divider} {asset.species.length} species
    </>
  )
}

const AssetResultsItem = ({
  asset,
  onClick,
  relation,
  // settings
  isSelected = false,
  isDimmed = false,
  controls: Controls,
}: {
  asset?: Asset | PublicAsset | AssetSearchResult
  onClick?: (event: React.SyntheticEvent<HTMLElement>) => void | false
  relation?: Relation
  isSelected?: boolean
  isDimmed?: boolean
  controls?: React.FC
}) => {
  const classes = useStyles()
  const [, , prefs] = useUserPreferences()
  const showMoreInfo = prefs && prefs.showmoreinfo

  return (
    <Card
      className={`${classes.root} ${isSelected ? classes.selected : ''} ${
        isDimmed ? classes.dimmed : ''
      }`}>
      <CardActionArea>
        <Link
          to={
            asset
              ? routes.viewAssetWithVar.replace(
                  ':assetId',
                  asset.slug || asset.id
                )
              : ''
          }
          onClick={onClick}>
          <LazyLoad height={200}>
            <CardMedia
              className={classes.cardMedia}
              image={asset && asset.thumbnailurl ? asset.thumbnailurl : ''}
              title={asset && asset.title ? `Thumbnail for ${asset.title}` : ''}>
              {!asset || !asset.thumbnailurl ? <DefaultThumbnail /> : undefined}
            </CardMedia>
          </LazyLoad>
          <CardContent className={classes.cardContent}>
            <Typography className={classes.title}>
              {asset && asset.title ? (
                <>
                  <span title={asset.title.trim()}>{asset.title.trim()}</span>
                  {asset.isadult ? <LoyaltyIcon /> : null}
                </>
              ) : (
                <LoadingShimmer width="100%" height="40px" />
              )}
            </Typography>
            <Typography className={classes.author}>
              {asset ? (
                getIsPublicAsset(asset) && asset.authorname ? (
                  `by ${asset.authorname}`
                ) : null
              ) : (
                <LoadingShimmer width="80px" height="15px" />
              )}
            </Typography>
            <Typography className={classes.microText}>
              <strong>
                {asset ? (
                  getCategoryMeta(asset.category).nameSingular
                ) : (
                  <LoadingShimmer width="80px" height="15px" />
                )}
              </strong>{' '}
              <SpeciesOutput asset={asset} relation={relation} />
            </Typography>
            <div className={classes.moreInfo}>
              <div className={classes.controls}>
                {Controls ? (
                  <Controls />
                ) : (
                  <AddToCartButton
                    assetId={asset?.id}
                    className={classes.control}
                  />
                )}
              </div>
              {showMoreInfo && asset && 'price' in asset ? (
                asset.price > 0 || (getIsPublicAsset(asset) && asset.isfree) ? (
                  <Price
                    price={asset.price}
                    priceCurrency={asset.pricecurrency}
                    small
                  />
                ) : null
              ) : null}
            </div>
          </CardContent>{' '}
        </Link>
      </CardActionArea>
    </Card>
  )
}

export default AssetResultsItem
