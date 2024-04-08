import React, { useEffect, useRef } from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import LazyLoad from 'react-lazyload'
import RoomIcon from '@material-ui/icons/Room'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import Checkbox from '@material-ui/core/Checkbox'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'
import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'
import FormattedDate from '../formatted-date'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import {
  ApprovalStatuses,
  PinnedStatuses,
  PublishStatuses,
} from '../../hooks/useDatabaseQuery'
import LoadingShimmer from '../loading-shimmer'
import AddToCartButton from '../add-to-cart-button'
import Chip from '../chip'
import { Asset, FullAsset } from '../../modules/assets'
import useIsEditor from '../../hooks/useIsEditor'
import useBulkEdit from '../../hooks/useBulkEdit'
import SelectedTick from '../selected-tick'
import useTagBlacklist from '../../hooks/useTagBlacklist'

const chipMargin = '0.25rem'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '200px',
    height: '100%',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
    },
    overflow: 'hidden',
  },
  landscape: {
    width: '100%',
    '& $media': {
      width: '200px',
    },
  },
  landscapeLink: {
    display: 'flex',
  },
  media: {
    position: 'relative', // nsfw chip
    zIndex: -1,
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px',
    },
    flexShrink: 0,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  categoryChip: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  categoryChipWithMargin: {
    margin: chipMargin,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  extraChips: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex',
  },
  extraChip: {
    margin: chipMargin,
    marginLeft: '0.1rem',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  extraChipWithIcon: {
    width: '32px', // make rounded
  },
  date: {
    margin: '0.25rem 0 0.5rem',
    color: theme.palette.text.secondary,
  },
  costChipWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: chipMargin,
  },
  costChip: {
    background: '#333333', // todo: grab from theme?
  },
  nsfwChip: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: '0.25rem',
  },
  actionArea: {
    zIndex: 1,
  },
  hoverOnEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: 'translate(-25%, -5%)',
    width: '300px',
    height: '300px',
    background: '#000',
    '& img': {
      height: '100%',
    },
    zIndex: 100,
    boxShadow: '1px 1px 5px #000',
  },
  pedestal: {
    width: '100%',
    '& video': {
      background: 'rgba(0,0,0,1)',
    },
  },
  slideContent: {
    position: 'absolute',
    top: '50%',
    left: 0,
    zIndex: 110,
    transform: 'translateY(-50%)',
  },
  slideLoadingSpinner: {
    width: '100%',
    position: 'absolute',
    top: '50%',
    left: 0,
    zIndex: 109,
    transform: 'translateY(-50%)',
  },
  carouselBtn: {
    border: 'none', // is a "button"
    borderRadius: '100%',
    background: 'rgba(0,0,0,0.5)',
    color: '#FFF',
    position: 'absolute',
    top: '50%',
    width: '30px',
    height: '30px',
    marginTop: '-15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:disabled': {
      opacity: '0',
    },
  },
  carouselNextBtn: {
    right: '10px',
  },
  carouselBackBtn: {
    left: '10px',
  },
  '@keyframes fadeInHoverOnEffect': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  slide: {
    position: 'relative',
  },
  dim: {
    opacity: '0.3',
  },
  addToCartButton: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  toggleBulkEditButton: {
    display: 'flex',
    justifyContent: 'center',
  },
  description: {
    overflowX: 'hidden',
  },
  freeChip: {
    backgroundColor: 'rgb(100, 150, 100)',
  },
  pushDownIcons: {
    paddingTop: '2.5rem',
  },
  blacklisted: {
    '& $media': {
      filter: 'blur(10px)',
    },
    '&:hover $media': {
      animationName: '$unblur',
      animationDuration: '3s',
      animationIterationCount: 1,
      animationFillMode: 'forwards',
    },
  },
  '@keyframes unblur': {
    '0%': {
      filter: 'blur(10px)',
    },
    '90%': {
      filter: 'blur(10px)',
    },
    '100%': {
      filter: 'blur(0px)',
    },
  },
}))

function truncateTextAndAddEllipsis(text: string): string {
  return text && text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

function ExtraChips({
  asset,
  showCategory = false,
  categoryName = '',
  showCost = false,
  isFree,
  isPaid,
  pushDown,
}: {
  asset: FullAsset
  showCategory: boolean
  categoryName: string
  showCost: boolean
  isFree: boolean
  isPaid: boolean
  pushDown: boolean
}) {
  const classes = useStyles()
  return (
    <div
      className={`${classes.extraChips} ${
        pushDown ? classes.pushDownIcons : ''
      }`}>
      {asset.approvalstatus === ApprovalStatuses.Waiting && (
        <Chip label="Unapproved" className={classes.extraChip} />
      )}
      {asset.publishstatus === PublishStatuses.Draft && (
        <Chip label="Draft" className={classes.extraChip} />
      )}
      {asset.pinnedstatus === PinnedStatuses.Pinned && (
        <Chip icon={<RoomIcon />} label={false} className={classes.extraChip} />
      )}
      {showCategory && <CategoryChip categoryName={categoryName} />}
      {showCost && <CostChip isFree={isFree} isPaid={isPaid} />}
    </div>
  )
}

const CategoryChip = ({ categoryName }: { categoryName: string }) => {
  const classes = useStyles()

  // handle weird edge case when category has been deleted
  const label =
    categoryName in categoryMeta
      ? categoryMeta[categoryName].nameSingular
      : categoryName
  const Icon =
    categoryName in categoryMeta ? categoryMeta[categoryName].icon : null

  return (
    <Chip
      icon={Icon ? <Icon /> : undefined}
      label={false}
      className={classes.extraChip}
      title={label}
    />
  )
}

const CostChip = ({ isFree, isPaid }: { isFree: boolean; isPaid: boolean }) => {
  const classes = useStyles()

  if (!isFree && !isPaid) {
    return null
  }

  return (
    <Chip
      title={isFree ? 'Free' : isPaid ? 'Paid' : ''}
      icon={isFree ? undefined : isPaid ? <AttachMoneyIcon /> : undefined}
      label={isFree ? 'FREE' : false}
      className={`${classes.extraChip} ${isFree ? classes.freeChip : ''}`}
    />
  )
}

const ToggleBulkEditButton = ({ asset }: { asset: Asset }) => {
  const { ids, toggleAsset, selectAsset, isSelectingAll } = useBulkEdit()

  useEffect(() => {
    if (!isSelectingAll) {
      return
    }

    selectAsset(asset)
  }, [isSelectingAll])

  if (!ids) {
    return null
  }

  return (
    <Checkbox
      checked={ids.includes(asset.id)}
      onClick={(e) => {
        toggleAsset(asset)
        e.stopPropagation()
        e.preventDefault()
        return false
      }}
    />
  )
}

const getIsFree = (tags: string[]): boolean =>
  tags && (tags.includes('free') || tags.includes('free model'))
const getIsPaid = (tags: string[]): boolean =>
  tags && (tags.includes('paid') || tags.includes('paid model'))

const AssetResultsItem = ({
  // @ts-ignore
  asset = {},
  showCategory = false,
  showCost = true,
  showIsNsfw = true,
  isLandscape = false,
  isSelected = false,
  dim = false,
  onClick,
  shimmer = false,
  showAddToCart = false,
  showSelectedTick = false,
  pushDownIcons = false,
}: {
  asset?: Asset
  showCategory?: boolean
  showCost?: boolean
  showIsNsfw?: boolean
  isLandscape?: boolean
  isSelected?: boolean
  dim?: boolean
  onClick?: (event: React.SyntheticEvent<HTMLElement>) => void
  shimmer?: boolean
  showAddToCart?: boolean
  showSelectedTick?: boolean
  pushDownIcons?: boolean
}) => {
  const classes = useStyles()
  const cardRef = useRef<HTMLDivElement>()
  const isEditor = useIsEditor()
  const tagBlacklist = useTagBlacklist()

  if (shimmer) {
    return (
      <div className={classes.root}>
        <LoadingShimmer height={300} />
      </div>
    )
  }

  const isBlacklisted =
    tagBlacklist &&
    tagBlacklist.length &&
    tagBlacklist.find((blacklistedTag) => asset.tags.includes(blacklistedTag))

  return (
    <Card
      className={`${classes.root} ${isLandscape ? classes.landscape : ''} ${
        dim ? classes.dim : ''
      } ${isBlacklisted ? classes.blacklisted : ''}`}
      ref={cardRef}>
      {isEditor && (
        <div className={classes.toggleBulkEditButton}>
          <ToggleBulkEditButton asset={asset} />
        </div>
      )}
      <CardActionArea className={classes.actionArea}>
        <Link
          to={routes.viewAssetWithVar.replace(
            ':assetId',
            asset.slug || asset.id
          )}
          className={`${isLandscape ? classes.landscapeLink : ''}`}
          onClick={onClick}>
          <ExtraChips
            // @ts-ignore
            asset={asset}
            showCategory={showCategory}
            categoryName={asset.category}
            showCost={showCost}
            isFree={getIsFree(asset.tags)}
            isPaid={getIsPaid(asset.tags)}
            pushDown={pushDownIcons}
          />
          {showAddToCart && (
            <div className={classes.addToCartButton}>
              <AddToCartButton assetId={asset.id} />
            </div>
          )}
          <LazyLoad height={200}>
            <CardMedia
              className={classes.media}
              image={asset.thumbnailurl || defaultThumbnailUrl}
              title={`Thumbnail for ${asset.title}`}>
              {asset.isadult && showIsNsfw && (
                <Chip label="NSFW" className={classes.nsfwChip} />
              )}
            </CardMedia>
          </LazyLoad>
          <CardContent>
            <Typography variant="h5" component="h2">
              {asset.title}
            </Typography>
            {asset.createdat && (
              <div className={classes.date}>
                <FormattedDate date={asset.createdat} />
              </div>
            )}
            <Typography
              variant="body2"
              color="textSecondary"
              component="p"
              className={classes.description}>
              {truncateTextAndAddEllipsis(asset.description)}
            </Typography>
          </CardContent>
        </Link>
      </CardActionArea>

      {showSelectedTick && isSelected ? <SelectedTick /> : null}
    </Card>
  )
}

export default AssetResultsItem
