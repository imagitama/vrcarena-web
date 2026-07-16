import React from 'react'
import { makeStyles } from '@mui/styles'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import LazyLoad from '@/components/lazy-load'
import LoyaltyIcon from '@mui/icons-material/Loyalty'
import LinkIcon from '@mui/icons-material/Link'
import EditIcon from '@mui/icons-material/Edit'
import Chip from '@mui/material/Chip'

import * as routes from '@/routes'
import {
  Asset,
  AssetCategory,
  AssetForList,
  FullAsset,
  PublicAsset,
  Relation,
  getIsPublicAsset,
} from '@/modules/assets'
import useUserPreferences from '@/hooks/useUserPreferences'
import { getCategoryMeta } from '@/category-meta'
import { mediaQueryForTabletsOrBelow } from '@/media-queries'
import { AssetSearchResult } from '@/hooks/useAlgoliaSearch'
import { AccessStatus, ApprovalStatus, PublishStatus } from '@/modules/common'

import Link from '@/components/link'
import DefaultThumbnail from '@/components/default-thumbnail'
import Price from '@/components/price'
import LoadingShimmer from '@/components/loading-shimmer'
import Tooltip from '@/components/tooltip'
import classNames from 'classnames'
import CheckboxInput from '../checkbox-input'
import useBulkEdit from '@/hooks/useBulkEdit'

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
    width: '100px',
    [mediaQueryForTabletsOrBelow]: {
      width: '100px',
    },
    fontSize: '75%',
    '& $cardMedia': {
      width: '100px',
      height: '100px',
    },
    '& $cardContent': {
      padding: '0.5rem',
    },
  },
  button: {
    height: '100%',
    font: 'inherit',
    '& > a': {
      height: '100%',
    },
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
    // height: '16px',
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
  public: {
    backgroundColor: 'rgb(0, 100, 0) !important',
  },
  waitingForApproval: {
    backgroundColor: 'rgb(100, 100, 0) !important',
  },
  draft: {},
  deleted: {
    backgroundColor: 'rgb(100, 0, 0) !important',
  },
  declined: {
    backgroundColor: 'rgb(100, 0, 0) !important',
  },
  quarantined: {
    '&&': {
      background: `repeating-linear-gradient(
    45deg,
    rgba(0,0,0,0.25) 0,
    rgba(0,0,0,0.25) 0.25rem,
    rgba(255, 221, 0, 0.25) 0.25rem,
    rgba(255, 221, 0, 0.25) 0.5rem
  )`,
    },
  },
})

const divider = '/'

const getAssetStateText = (
  asset: AssetForList | FullAsset
): null | {
  title: string
  class: keyof ReturnType<typeof useStyles>
  label: string
} => {
  switch (asset.accessstatus) {
    case AccessStatus.Deleted:
      return {
        label: 'Deleted',
        title:
          'This asset has been deleted by the editorial team. Please view the editor notes for more info.',
        class: 'deleted',
      }
  }

  switch (asset.publishstatus) {
    case PublishStatus.Draft:
      return {
        label: 'Draft',
        title:
          'This asset is a draft and requires publishing before it is visible to everyone.',
        class: 'draft',
      }
  }

  switch (asset.approvalstatus) {
    case ApprovalStatus.Declined:
      return {
        label: 'Declined',
        title:
          'This asset was declined by our staff. Please view the editor notes and comments.',
        class: 'declined',
      }

    case ApprovalStatus.Quarantined:
      return {
        label: 'Quarantined',
        title:
          'This asset has been manually quarantined and cannot be approved until it has been un-quarantined.',
        class: 'quarantined',
      }

    case ApprovalStatus.Approved:
    case ApprovalStatus.AutoApproved:
      return {
        label: `Visible${
          asset.approvalstatus === ApprovalStatus.AutoApproved ? '*' : ''
        }`,
        title:
          'This asset is visible in search results, viewing someone like an author, browsing a category, browsing a species, etc. (* = auto-approved)',
        class: 'public',
      }

    case ApprovalStatus.Waiting:
      return {
        label: 'Pending',
        title:
          'This asset is waiting to be approved. It may be auto-approved if conditions are met.',
        class: 'waitingForApproval',
      }
  }

  return null
}

const AssetState = ({ asset }: { asset: AssetForList | FullAsset }) => {
  const classes = useStyles()
  const result = getAssetStateText(asset)

  if (!result) return null

  return (
    <Tooltip title={result.title}>
      <Chip className={classes[result.class]} label={result.label} />
    </Tooltip>
  )
}

const SpeciesOutput = ({
  asset,
  relation,
  showDivider = true,
}: {
  asset?: Asset | PublicAsset | AssetSearchResult
  relation?: Relation
  showDivider?: boolean
}) => {
  const classes = useStyles()

  if (relation) {
    return (
      <span className={classes.relation}>
        {showDivider && divider} {relation.label || relation.type} <LinkIcon />
      </span>
    )
  }

  if (!asset) {
    return (
      <>
        {showDivider && divider} <LoadingShimmer width="40px" height="10px" />
      </>
    )
  }

  if (!asset.species || !asset.species.length) {
    return null
  }

  if ('speciesnames' in asset && asset.speciesnames !== null) {
    return (
      <>
        {showDivider && divider} {(asset as FullAsset).speciesnames.join(', ')}
      </>
    )
  }

  return (
    <>
      {showDivider && divider} {asset.species.length} species
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
  showMoreInfo = undefined,
  className,
  showCategory = true,
}: {
  asset?: Asset | PublicAsset | FullAsset | AssetSearchResult
  onClick?: (event: React.SyntheticEvent<HTMLElement>) => void | false
  relation?: Relation
  isTiny?: boolean // relation verification required
  isSelected?: boolean
  isDimmed?: boolean
  controls?: React.ReactElement | null
  toggleEditMode?: () => void
  showState?: boolean
  showMoreInfo?: boolean
  className?: string
  showCategory?: boolean // for <AssetTree />
}) => {
  const classes = useStyles()
  const [, , prefs] = useUserPreferences()
  const actuallyShowMoreInfo =
    (prefs && prefs.showmoreinfo) || showMoreInfo === true
  const bulkEdit = useBulkEdit()

  if (Controls === undefined && bulkEdit.isInMode && asset) {
    Controls = (
      <>
        <CheckboxInput
          value={bulkEdit.ids!.includes(asset.id)}
          onClick={(e) => {
            bulkEdit.toggleId(asset.id)
            e.stopPropagation()
            e.preventDefault()
            return false
          }}
        />
      </>
    )
  }

  return (
    <Card
      className={classNames(
        classes.root,
        {
          [classes.selected]: isSelected,
          [classes.dimmed]: isDimmed,
          [classes.tiny]: isTiny,
        },
        className
      )}>
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
          <LazyLoad placeholder={<DefaultThumbnail isTiny={isTiny} />}>
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
                <LoadingShimmer width="100%" height="23px" />
              )}
            </div>
            <div className={classes.author}>
              {asset ? (
                `by ${asset.authorname || '(unnamed)'}`
              ) : (
                <LoadingShimmer width="80px" height="12px" marginTop={'2px'} />
              )}
            </div>
            <div className={classes.microText}>
              {showCategory && (
                <strong>
                  {asset ? (
                    getCategoryMeta(asset.category).nameSingular
                  ) : (
                    <LoadingShimmer width="80px" height="12px" />
                  )}
                </strong>
              )}{' '}
              {asset?.category === AssetCategory.Avatar ||
                (relation && (
                  <SpeciesOutput
                    asset={asset}
                    relation={relation}
                    showDivider={showCategory !== false}
                  />
                ))}
            </div>
            {Controls || actuallyShowMoreInfo || showState ? (
              <div className={classes.moreInfo}>
                <div className={classes.controls}>
                  {Controls ? (
                    React.cloneElement(Controls)
                  ) : Controls !== null ? (
                    <>
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
                {actuallyShowMoreInfo &&
                asset &&
                'price' in asset &&
                asset.price ? (
                  asset.price > 0 ||
                  (getIsPublicAsset(asset) && asset.isfree) ? (
                    <Price
                      price={asset.price}
                      priceCurrency={asset.pricecurrency}
                      small
                    />
                  ) : null
                ) : null}
                {showState && asset && 'accessstatus' in asset && (
                  <AssetState asset={asset as AssetForList} />
                )}
              </div>
            ) : null}
          </CardContent>{' '}
        </Link>
      </CardActionArea>
    </Card>
  )
}

export default AssetResultsItem
