import React, { useEffect, useState, useRef } from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import LazyLoad from 'react-lazyload'
import RoomIcon from '@material-ui/icons/Room'
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  Image
} from 'pure-react-carousel'
import 'pure-react-carousel/dist/react-carousel.es.css'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'
import Checkbox from '@material-ui/core/Checkbox'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'
import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'
import FormattedDate from '../formatted-date'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import useDatabaseQuery, {
  ApprovalStatuses,
  AssetFieldNames,
  AssetMetaFieldNames,
  CollectionNames,
  PinnedStatuses,
  PublishStatuses
} from '../../hooks/useDatabaseQuery'
import PedestalVideo from '../pedestal-video'
import { isUrlAnImage } from '../../utils'
import LoadingIndicator from '../loading-indicator'
import LoadingShimmer from '../loading-shimmer'
import AddToCartButton from '../add-to-cart-button'
import Chip from '../chip'
import { Asset, FullAsset } from '../../modules/assets'
import useIsEditor from '../../hooks/useIsEditor'
import useBulkEdit from '../../hooks/useBulkEdit'

const chipMargin = '0.25rem'

const useStyles = makeStyles(theme => ({
  root: {
    width: '200px',
    height: '100%',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px'
    },
    overflow: 'visible'
  },
  landscape: {
    width: '100%',
    '& $media': {
      width: '200px'
    }
  },
  landscapeLink: {
    display: 'flex'
  },
  media: {
    position: 'relative', // nsfw chip
    zIndex: -1,
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px'
    },
    flexShrink: 0
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  categoryChip: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  categoryChipWithMargin: {
    margin: chipMargin,
    '&:hover': {
      cursor: 'pointer'
    }
  },
  extraChips: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex'
  },
  extraChip: {
    margin: chipMargin,
    marginLeft: '0.1rem',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  extraChipWithIcon: {
    width: '32px' // make rounded
  },
  date: {
    margin: '0.25rem 0 0.5rem',
    color: theme.palette.text.secondary
  },
  costChipWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: chipMargin
  },
  costChip: {
    background: '#333333' // todo: grab from theme?
  },
  nsfwChip: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: '0.25rem'
  },
  actionArea: {
    zIndex: 1
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
      height: '100%'
    },
    zIndex: 100,
    boxShadow: '1px 1px 5px #000'
  },
  pedestal: {
    width: '100%',
    '& video': {
      background: 'rgba(0,0,0,1)'
    }
  },
  slideContent: {
    position: 'absolute',
    top: '50%',
    left: 0,
    zIndex: 110,
    transform: 'translateY(-50%)'
  },
  slideLoadingSpinner: {
    width: '100%',
    position: 'absolute',
    top: '50%',
    left: 0,
    zIndex: 109,
    transform: 'translateY(-50%)'
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
      opacity: '0'
    }
  },
  carouselNextBtn: {
    right: '10px'
  },
  carouselBackBtn: {
    left: '10px'
  },
  '@keyframes fadeInHoverOnEffect': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  slide: {
    position: 'relative'
  },
  unselected: {
    opacity: '0.3'
  },
  addToCartButton: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  toggleBulkEditButton: {
    position: 'absolute',
    top: 0,
    left: 30
  },
  description: {
    overflowX: 'hidden'
  }
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
  isPaid
}: {
  asset: FullAsset
  showCategory: boolean
  categoryName: string
  showCost: boolean
  isFree: boolean
  isPaid: boolean
}) {
  const classes = useStyles()
  return (
    <div className={classes.extraChips}>
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
      icon={
        isFree ? <MoneyOffIcon /> : isPaid ? <AttachMoneyIcon /> : undefined
      }
      label={false}
      className={classes.extraChip}
    />
  )
}

function HoverOnContent({ asset }: { asset: Asset }) {
  const classes = useStyles()

  const carouselItems = []

  if (asset.pedestalvideourl) {
    carouselItems.push(
      <div className={classes.pedestal}>
        <PedestalVideo
          videoUrl={asset.pedestalvideourl}
          fallbackImageUrl={asset.pedestalfallbackimageurl}
        />
      </div>
    )
  }

  const attachedImageUrls = asset.fileurls.filter(isUrlAnImage)

  if (attachedImageUrls.length) {
    attachedImageUrls.forEach(url => {
      carouselItems.push(
        <Image src={url} alt="Attachment" hasMasterSpinner={false} />
      )
    })
  }

  carouselItems.push(
    <Image src={asset.thumbnailurl} hasMasterSpinner={false} />
  )

  return (
    <CarouselProvider
      naturalSlideWidth={300}
      naturalSlideHeight={300}
      totalSlides={carouselItems.length}>
      <Slider>
        {carouselItems.map((item, idx) => (
          <Slide index={idx} className={classes.slide}>
            <Link
              to={routes.viewAssetWithVar.replace(
                ':assetId',
                asset.slug || asset.id
              )}>
              <div className={classes.slideContent}>{item}</div>
              <div className={classes.slideLoadingSpinner}>
                <LoadingIndicator />
              </div>
            </Link>
          </Slide>
        ))}
      </Slider>
      <ButtonBack
        className={`${classes.carouselBtn} ${classes.carouselBackBtn}`}>
        <ChevronLeftIcon />
      </ButtonBack>
      <ButtonNext
        className={`${classes.carouselBtn} ${classes.carouselNextBtn}`}>
        <ChevronRightIcon />
      </ButtonNext>
    </CarouselProvider>
  )
}

function HoverOnEffect({ assetId }: { assetId: string }) {
  const classes = useStyles()
  // @ts-ignore
  const [, , asset] = useDatabaseQuery<Asset>(CollectionNames.Assets, assetId)

  if (!asset || Array.isArray(asset)) {
    return null
  }

  return (
    <div className={classes.hoverOnEffect}>
      {asset ? <HoverOnContent asset={asset} /> : null}
    </div>
  )
}

const ToggleBulkEditButton = ({ id }: { id: string }) => {
  const { ids, toggleId, selectId, isSelectingAll } = useBulkEdit()

  useEffect(() => {
    if (!isSelectingAll) {
      return
    }

    selectId(id)
  }, [isSelectingAll])

  if (!ids) {
    return null
  }

  return (
    <Checkbox
      checked={ids.includes(id)}
      onClick={e => {
        toggleId(id)
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
  hoverOnEffect = false,
  isUnselected = false,
  onClick,
  shimmer = false,
  showAddToCart = false
}: {
  asset?: Asset
  showCategory?: boolean
  showCost?: boolean
  showIsNsfw?: boolean
  isLandscape?: boolean
  hoverOnEffect?: boolean
  isUnselected?: boolean
  onClick?: () => void
  shimmer?: boolean
  showAddToCart?: boolean
}) => {
  const classes = useStyles()
  const cardRef = useRef<HTMLDivElement>()
  const [isHoverOnEffectVisible, setIsHoverOnEffectVisible] = useState(false)
  const isEditor = useIsEditor()

  useEffect(() => {
    if (!hoverOnEffect) {
      return
    }

    const onMouseOver = () => {
      setIsHoverOnEffectVisible(true)
    }

    const onMouseLeave = () => {
      setIsHoverOnEffectVisible(false)
    }

    if (cardRef.current) {
      cardRef.current.addEventListener('mouseover', onMouseOver)
      cardRef.current.addEventListener('mouseleave', onMouseLeave)
    }

    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener('mouseover', onMouseOver)
        cardRef.current.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }, [hoverOnEffect])

  if (shimmer) {
    return (
      <div className={classes.root}>
        <LoadingShimmer height={300} />
      </div>
    )
  }

  return (
    <Card
      className={`${classes.root} ${isLandscape ? classes.landscape : ''} ${
        isUnselected ? classes.unselected : ''
      }`}
      ref={cardRef}>
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
          />
          {showAddToCart && (
            <div className={classes.addToCartButton}>
              <AddToCartButton assetId={asset.id} />
            </div>
          )}
          {isEditor && (
            <div className={classes.toggleBulkEditButton}>
              <ToggleBulkEditButton id={asset.id} />
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

      {isHoverOnEffectVisible && hoverOnEffect && (
        <HoverOnEffect assetId={asset.id} />
      )}
    </Card>
  )
}

export default AssetResultsItem
