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
  description: {
    overflowX: 'hidden'
  }
}))

function truncateTextAndAddEllipsis(text) {
  return text && text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

function ExtraChips({
  asset,
  showCategory = false,
  categoryName = '',
  showCost = false,
  isFree,
  isPaid
}) {
  const classes = useStyles()
  return (
    <div className={classes.extraChips}>
      {asset[AssetMetaFieldNames.approvalStatus] ===
        ApprovalStatuses.Waiting && (
        <Chip label="Unapproved" className={classes.extraChip} />
      )}
      {asset[AssetMetaFieldNames.publishStatus] === PublishStatuses.Draft && (
        <Chip label="Draft" className={classes.extraChip} />
      )}
      {asset[AssetMetaFieldNames.pinnedStatus] === PinnedStatuses.Pinned && (
        <Chip icon={<RoomIcon />} label={false} className={classes.extraChip} />
      )}
      {showCategory && <CategoryChip categoryName={categoryName} />}
      {showCost && <CostChip isFree={isFree} isPaid={isPaid} />}
    </div>
  )
}

const CategoryChip = ({ categoryName }) => {
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

const CostChip = ({ isFree, isPaid }) => {
  const classes = useStyles()

  if (!isFree && !isPaid) {
    return null
  }

  return (
    <Chip
      title={isFree ? 'Free' : isPaid ? 'Paid' : ''}
      icon={isFree ? <MoneyOffIcon /> : isPaid ? <AttachMoneyIcon /> : ''}
      label={false}
      className={classes.extraChip}
    />
  )
}

function HoverOnContent({ asset }) {
  const classes = useStyles()

  const carouselItems = []

  if (asset[AssetFieldNames.pedestalVideoUrl]) {
    carouselItems.push(
      <div className={classes.pedestal}>
        <PedestalVideo
          videoUrl={asset[AssetFieldNames.pedestalVideoUrl]}
          fallbackImageUrl={asset[AssetFieldNames.pedestalFallbackImageUrl]}
        />
      </div>
    )
  }

  const attachedImageUrls = asset[AssetFieldNames.fileUrls].filter(isUrlAnImage)

  if (attachedImageUrls.length) {
    attachedImageUrls.forEach(url => {
      carouselItems.push(<Image src={url} alt="Attachment" />)
    })
  }

  carouselItems.push(<Image src={asset[AssetFieldNames.thumbnailUrl]} />)

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
                asset[AssetFieldNames.slug] || asset.id
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

function HoverOnEffect({ assetId }) {
  const classes = useStyles()
  const [, , asset] = useDatabaseQuery(CollectionNames.Assets, assetId)

  return (
    <div className={classes.hoverOnEffect}>
      {asset && <HoverOnContent asset={asset} />}
    </div>
  )
}

const getIsFree = tags =>
  tags && (tags.includes('free') || tags.includes('free model'))
const getIsPaid = tags =>
  tags && (tags.includes('paid') || tags.includes('paid model'))

export default function AssetItem({
  asset = {},
  showCategory = false,
  showCost = true,
  showIsNsfw = true,
  isLandscape = false,
  hoverOnEffect = false,
  isUnselected = false,
  onClick = null,
  shimmer = false,
  showAddToCart = false
}) {
  const classes = useStyles()
  const cardRef = useRef()
  const [isHoverOnEffectVisible, setIsHoverOnEffectVisible] = useState(false)

  const {
    id,
    [AssetFieldNames.title]: title,
    [AssetFieldNames.description]: description,
    [AssetFieldNames.thumbnailUrl]: thumbnailUrl,
    [AssetFieldNames.isAdult]: isAdult,
    [AssetFieldNames.category]: category,
    [AssetFieldNames.createdAt]: createdAt,
    [AssetFieldNames.tags]: tags,
    [AssetFieldNames.slug]: slug
  } = asset || {}

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

    cardRef.current.addEventListener('mouseover', onMouseOver)

    cardRef.current.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cardRef.current.removeEventListener('mouseover', onMouseOver)
      cardRef.current.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [hoverOnEffect])

  if (shimmer) {
    return (
      <div className={`${classes.root} ${classes.shimmer}`}>
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
          to={routes.viewAssetWithVar.replace(':assetId', slug || id)}
          className={`${classes.link} ${
            isLandscape ? classes.landscapeLink : ''
          }`}
          onClick={onClick}>
          <ExtraChips
            asset={asset}
            showCategory={showCategory}
            categoryName={category}
            showCost={showCost}
            isFree={getIsFree(tags)}
            isPaid={getIsPaid(tags)}
          />
          {showAddToCart && (
            <div className={classes.addToCartButton}>
              <AddToCartButton assetId={id} />
            </div>
          )}
          <LazyLoad width={200} height={200}>
            <CardMedia
              className={classes.media}
              image={thumbnailUrl || defaultThumbnailUrl}
              title={`Thumbnail for ${title}`}>
              {isAdult && showIsNsfw && (
                <Chip label="NSFW" className={classes.nsfwChip} />
              )}
            </CardMedia>
          </LazyLoad>
          <CardContent>
            <Typography variant="h5" component="h2">
              {title}
            </Typography>
            {createdAt && (
              <div className={classes.date}>
                <FormattedDate date={createdAt} />
              </div>
            )}
            <Typography
              variant="body2"
              color="textSecondary"
              component="p"
              className={classes.description}>
              {truncateTextAndAddEllipsis(description)}
            </Typography>
          </CardContent>
        </Link>
      </CardActionArea>

      {isHoverOnEffectVisible && hoverOnEffect && (
        <HoverOnEffect assetId={id} />
      )}
    </Card>
  )
}
