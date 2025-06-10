import React from 'react'
import { makeStyles } from '@mui/styles'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import LazyLoad from 'react-lazyload'
import LoyaltyIcon from '@mui/icons-material/Loyalty'
import LinkIcon from '@mui/icons-material/Link'
import EditIcon from '@mui/icons-material/Edit'
import Chip from '@mui/material/Chip'

import * as routes from '../../routes'
import {
  Asset,
  FullAsset,
  PublicAsset,
  Relation,
  getIsAssetADraft,
  getIsAssetDeclined,
  getIsAssetVisibleToEveryone,
  getIsAssetWaitingForApproval,
  getIsFullAsset,
  getIsPublicAsset,
} from '../../modules/assets'
import useUserPreferences from '../../hooks/useUserPreferences'
import { getCategoryMeta } from '../../category-meta'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import { AssetSearchResult } from '../../hooks/useAlgoliaSearch'
import { AccessStatus } from '../../modules/common'

import Link from '../link'
import AddToCartButton from '../add-to-cart-button'
import DefaultThumbnail from '../default-thumbnail'
import Price from '../price'
import LoadingShimmer from '../loading-shimmer'

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
    '& .cardMedia': {
      width: '100px',
      height: '100px',
    },
    '& .cardContent': {
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
  relation: {
    display: 'inline-flex',
    alignItems: 'center',
    '& svg': {
      fontSize: '1em',
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
  // chips
  visibleToEveryone: {
    backgroundColor: 'rgb(0, 100, 0)',
  },
  waitingForApproval: {
    backgroundColor: 'rgb(100, 100, 0)',
  },
  draft: {},
  deleted: {
    backgroundColor: 'rgb(100, 0, 0)',
  },
  declined: {
    backgroundColor: 'rgb(100, 0, 0)',
  },
})

const divider = '/'

const AssetState = ({ asset }: { asset: FullAsset }) => {
  const classes = useStyles()

  if (asset.accessstatus === AccessStatus.Deleted) {
    return <Chip className={classes.deleted} label="Deleted" />
  }

  if (asset.accessstatus === AccessStatus.Archived) {
    return <Chip className={classes.deleted} label="Archived" />
  }

  if (getIsAssetWaitingForApproval(asset)) {
    return (
      <Chip
        className={classes.waitingForApproval}
        label="Waiting For Approval"
      />
    )
  }

  if (getIsAssetDeclined(asset)) {
    return <Chip className={classes.declined} label="Declined" />
  }

  if (getIsAssetADraft(asset)) {
    return <Chip className={classes.draft} label="Draft" />
  }

  if (getIsAssetVisibleToEveryone(asset)) {
    return <Chip className={classes.visibleToEveryone} label="Visible" />
  }

  return null
}

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
        {divider} {(asset as FullAsset).speciesnames.join(', ')}
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
  isTiny = false,
  controls: Controls,
  // extra
  toggleEditMode = undefined,
  showState = false,
}: {
  asset?: Asset | PublicAsset | FullAsset | AssetSearchResult
  onClick?: (event: React.SyntheticEvent<HTMLElement>) => void | false
  relation?: Relation
  isTiny?: boolean // relation verification required
  isSelected?: boolean
  isDimmed?: boolean
  controls?: React.FC | null
  toggleEditMode?: () => void
  showState?: boolean
}) => {
  const classes = useStyles()
  const [, , prefs] = useUserPreferences()
  const showMoreInfo = prefs && prefs.showmoreinfo

  return (
    <Card
      className={`${classes.root} ${isSelected ? classes.selected : ''} ${
        isDimmed ? classes.dimmed : ''
      } ${isTiny ? classes.tiny : ''}`}>
      <CardActionArea className={classes.button}>
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
          <LazyLoad
            height={isTiny ? 100 : 200}
            placeholder={<DefaultThumbnail isTiny={isTiny} />}>
            <CardMedia
              className={classes.cardMedia}
              image={asset && asset.thumbnailurl ? asset.thumbnailurl : ''}
              title={
                asset && asset.title ? `Thumbnail for ${asset.title}` : ''
              }>
              {!asset || !asset.thumbnailurl ? (
                <DefaultThumbnail isTiny={isTiny} />
              ) : undefined}
            </CardMedia>
          </LazyLoad>
          <CardContent className={classes.cardContent}>
            <div className={classes.title}>
              {asset && asset.title ? (
                <>
                  <span title={asset.title.trim()}>{asset.title.trim()}</span>
                  {asset.isadult ? <LoyaltyIcon /> : null}
                </>
              ) : (
                <LoadingShimmer width="100%" height="40px" />
              )}
            </div>
            <div className={classes.author}>
              {asset ? (
                getIsPublicAsset(asset) && asset.authorname ? (
                  `by ${asset.authorname}`
                ) : null
              ) : (
                <LoadingShimmer width="80px" height="15px" />
              )}
            </div>
            <div className={classes.microText}>
              <strong>
                {asset ? (
                  getCategoryMeta(asset.category).nameSingular
                ) : (
                  <LoadingShimmer width="80px" height="15px" />
                )}
              </strong>{' '}
              <SpeciesOutput asset={asset} relation={relation} />
            </div>
            <div className={classes.moreInfo}>
              <div className={classes.controls}>
                {Controls ? (
                  <Controls />
                ) : Controls !== null ? (
                  <>
                    <AddToCartButton
                      assetId={asset?.id}
                      className={classes.control}
                    />
                    {toggleEditMode && (
                      <div
                        onClick={(e) => {
                          toggleEditMode()
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        className={classes.control}>
                        <EditIcon />
                      </div>
                    )}
                  </>
                ) : null}
              </div>
              {showMoreInfo && asset && 'price' in asset && asset.price ? (
                asset.price > 0 || (getIsPublicAsset(asset) && asset.isfree) ? (
                  <Price
                    price={asset.price}
                    priceCurrency={asset.pricecurrency}
                    small
                  />
                ) : null
              ) : null}
              {showState && getIsFullAsset(asset) && (
                <AssetState asset={asset} />
              )}
            </div>
          </CardContent>{' '}
        </Link>
      </CardActionArea>
    </Card>
  )
}

export default AssetResultsItem
