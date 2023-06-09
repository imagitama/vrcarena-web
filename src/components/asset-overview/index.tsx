import React, { useRef, useContext, useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'
import LinkIcon from '@material-ui/icons/Link'
import AccessibilityNewIcon from '@material-ui/icons/AccessibilityNew'
import LazyLoad from 'react-lazyload'
import WarningIcon from '@material-ui/icons/Warning'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'

// icons
import BuildIcon from '@material-ui/icons/Build'
import LoyaltyIcon from '@material-ui/icons/Loyalty'

import useDataStore from '../../hooks/useDataStore'
import useBanner from '../../hooks/useBanner'
import { client as supabase } from '../../supabase'
import { AssetFieldNames, AssetCategories } from '../../hooks/useDatabaseQuery'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import useIsEditor from '../../hooks/useIsEditor'
import useUserRecord from '../../hooks/useUserRecord'
import {
  isUrlAnImage,
  isUrlNotAnImageOrVideo,
  getRandomInt,
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  isGitHubUrl,
  isGoogleDriveUrl,
  isTwitterUrl,
  isDiscordUrl,
  isUrlAYoutubeVideo,
  insertItemInbetweenAllItems
} from '../../utils'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow
} from '../../media-queries'
import { getCanUserEditAsset } from '../../assets'
import Link from '../../components/link'
import { ReactComponent as VRChatIcon } from '../../assets/images/icons/vrchat.svg'
import categoryMeta from '../../category-meta'
import { Asset, FullAsset, RelationType } from '../../modules/assets'

import AssetThumbnail from '../asset-thumbnail'
import Heading from '../heading'
import ErrorMessage from '../error-message'
import LoadingShimmer from '../loading-shimmer'
import ImageGallery from '../image-gallery'
import AssetFeatures from '../asset-features'
import PedestalVideo from '../pedestal-video'
import Price from '../price'
import TagChips from '../tag-chips'
import Button from '../button'
import AssetResultsItem from '../asset-results-item'
import FormattedDate from '../formatted-date'
import UsernameLink from '../username-link'
import GitHubReleases from '../github-releases'
import LoadingIndicator from '../loading-indicator'

// controls
import VisitSourceButton from '../visit-source-button'
import EndorseAssetButton from '../endorse-asset-button'
import AddToWishlistButton from '../add-to-wishlist-button'
import AddToCollectionButton from '../add-to-collection-button'

import AssetOverviewContext from './context'
import DiscordServerInfo from './components/discord-server-info'
import Messages from './components/messages'
import Control from './components/control'
import TabDescription from './components/tab-description'
import TabReviews from './components/tab-reviews'
import TabComments from './components/tab-comments'
import TabAttachments from './components/tab-attachments'
import TabAvatars from './components/tab-avatars'
import TabAdmin from './components/tab-admin'
import TabRelated from './components/tab-related'
import AddToCartButton from '../add-to-cart-button'
import { getUrlForVrChatWorldId } from '../../social-media'
import { getRankById } from '../../taxonomy'
import SpeciesList from '../species-list'

import Relations from '../relations'
import useAssetOverview from './useAssetOverview'
import OpenForCommissionsMessage from '../open-for-commissions-message'
import { getTitleForReason } from '../../events'

// controls
const LoggedInControls = React.lazy(() =>
  import(
    /* webpackChunkName: "asset-overview-logged-in-controls" */ './components/logged-in-controls'
  )
)
const EditorControls = React.lazy(() =>
  import(
    /* webpackChunkName: "asset-overview-editor-controls" */ './components/editor-controls'
  )
)
const CreatorControls = React.lazy(() =>
  import(
    /* webpackChunkName: "asset-overview-creator-controls" */ './components/creator-controls'
  )
)

const useStyles = makeStyles({
  // columns
  cols: {
    maxWidth: '100vw',
    display: 'flex',
    flexDirection: 'row',

    [mediaQueryForMobiles]: {
      flexDirection: 'column-reverse'
    }
  },
  leftCol: {
    paddingTop: '1rem',
    width: '100%',
    minWidth: 0 // fix flex shrink issue
  },
  rightCol: {
    maxWidth: '300px',
    flexShrink: 0,
    marginLeft: '1rem',
    [mediaQueryForMobiles]: {
      width: '100%',
      margin: '2rem 0 0'
    }
  },
  // content
  pedestalWrapper: {
    width: '25%',
    margin: '0 auto',
    cursor: 'pointer',
    transition: 'all 200ms',
    [mediaQueryForTabletsOrBelow]: {
      width: '50%'
    },
    [mediaQueryForMobiles]: {
      width: '100%'
    }
  },
  expanded: {
    width: '60%',
    [mediaQueryForTabletsOrBelow]: {
      width: '80%'
    },
    [mediaQueryForMobiles]: {
      width: '100%'
    }
  },
  authorName: {
    fontSize: '50%'
  },
  primaryImageGallery: {
    marginBottom: '1rem'
  },
  primaryMetadata: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '1rem',

    [mediaQueryForMobiles]: {
      flexDirection: 'column'
    }
  },
  thumbnailWrapper: {
    display: 'flex',
    justifyContent: 'center'
  },
  titleAndAuthor: {
    marginBottom: '0.5rem'
  },
  // controls
  controlGroup: {
    marginBottom: '1rem'
  },
  // parent
  parent: {
    margin: '2rem 0',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center'
  },
  parentWrapper: {
    position: 'relative'
  },
  parentIcon: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 10,
    background: 'rgba(0, 0, 0, 0.5)',
    '& a': {
      width: '100%',
      padding: '0.5rem',
      color: '#FFF',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 'bold'
    },
    '& svg': {
      fontSize: '150%',
      marginRight: '0.5rem'
    }
  },
  vrchatIcon: {
    fontSize: '200%',
    display: 'flex'
  },
  area: {
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '5px',
    padding: '1rem',
    marginBottom: '1rem'
  },
  areaLabel: {
    fontSize: '150%',
    marginBottom: '0.5rem',
    '& a': {
      color: 'inherit',
      display: 'flex',
      alignItems: 'center'
    },
    '&:hover $areaIcon': {
      opacity: 1
    }
  },
  areaIcon: {
    opacity: 0,
    transition: 'all 100ms',
    marginLeft: '0.5rem'
  },
  riskyFileNotice: {
    fontSize: '75%',
    padding: '0.25rem 0',
    '& svg': {
      fontSize: '100%'
    }
  },
  miniSaleInfo: {
    marginTop: '0.5rem',
    textAlign: 'center',
    '& a': {
      display: 'block',
      padding: '1rem',
      color: 'inherit'
    }
  },
  saleTitle: {
    fontSize: '150%',
    marginBottom: '0.25rem'
  }
})

const ParentControlGroup = () => {
  const { asset } = useAssetOverview()
  const classes = useStyles()

  const parent =
    asset &&
    asset.relations &&
    asset.relations.find(relation => relation.type === RelationType.Parent)

  if (!parent) {
    return null
  }

  const parentData = asset.relationsdata.find(
    relation => relation.id === parent.asset
  )

  if (!parentData) {
    return null
  }

  return (
    <ControlGroup>
      <div className={classes.parent}>
        <div className={classes.parentWrapper}>
          <div className={classes.parentIcon}>
            <Link
              to={routes.viewAssetWithVar.replace(':assetId', parentData.id)}>
              <LinkIcon /> <span>Parent</span>
            </Link>
          </div>
          <AssetResultsItem
            asset={parentData}
            showCategory={false}
            showCost={false}
          />
        </div>
      </div>
    </ControlGroup>
  )
}

const ControlGroup = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.controlGroup}>{children}</div>
}

const NsfwIcon = () => {
  const { asset, isLoading } = useAssetOverview()

  if (isLoading || !asset || !asset.isadult) {
    return null
  }

  return (
    <Link to={routes.nsfw}>
      <LoyaltyIcon />
    </Link>
  )
}

const getIsAssetFree = (tags: string[]): boolean =>
  tags && tags.includes('free')

const getLabelForCategory = (category: string): string => {
  switch (category) {
    case AssetCategories.avatar:
      return 'Accessories'
    default:
      return 'Linked Assets'
  }
}

const getVrchatWorldLaunchUrlForId = (worldId: string): string => {
  return `vrchat://launch?ref=vrchat.com&id=${worldId}:0`
}

const analyticsCategoryName = 'ViewAsset'

const Area = ({
  name,
  label,
  children
}: {
  name: string
  label?: string
  children: React.ReactNode
}) => {
  const classes = useStyles()
  const ref = useRef<HTMLDivElement>(null)
  const { assetId } = useAssetOverview()

  return (
    <div ref={ref}>
      <LazyLoad height={300} placeholder={<LoadingIndicator />}>
        <div className={classes.area}>
          {label ? (
            <div className={classes.areaLabel}>
              <Link
                to={routes.viewAssetWithVarAndTabVar
                  .replace(':assetId', assetId)
                  .replace(':tabName', name)}>
                {label} <LinkIcon className={classes.areaIcon} />
              </Link>
            </div>
          ) : null}
          {children}
        </div>
      </LazyLoad>
    </div>
  )
}

const isRiskyUrl = (url: string): boolean => {
  if (
    isGoogleDriveUrl(url) ||
    isGitHubUrl(url) ||
    isDiscordUrl(url) ||
    isTwitterUrl(url)
  ) {
    return true
  }

  return false
}

const RiskyFileNotice = ({ sourceUrl }: { sourceUrl?: string }) => {
  const classes = useStyles()

  if (!sourceUrl || (sourceUrl && !isRiskyUrl(sourceUrl))) {
    return null
  }

  return (
    <div className={classes.riskyFileNotice}>
      <WarningIcon /> This file has not been verified as safe to download. Use
      at your own risk.
    </div>
  )
}

const MiniSaleInfo = () => {
  const { asset } = useAssetOverview()
  const classes = useStyles()

  if (
    !asset ||
    !asset.salereason ||
    (asset.saleexpiresat && asset.saleexpiresat < new Date())
  ) {
    return null
  }

  return (
    <Card className={classes.miniSaleInfo}>
      <CardActionArea>
        <Link to={routes.viewAuthorWithVar.replace(':authorId', asset.author)}>
          <div className={classes.saleTitle}>
            {getTitleForReason(asset.salereason)} Sale!
          </div>
          Click here to view the author's sale info
        </Link>
      </CardActionArea>
    </Card>
  )
}

export default ({ assetId: rawAssetId }: { assetId: string }) => {
  const isLoggedIn = useIsLoggedIn()
  const isEditor = useIsEditor()
  const getQuery = useCallback(
    () =>
      supabase
        .from('getfullassets')
        .select('*')
        .or(`id.eq.${rawAssetId},${AssetFieldNames.slug}.eq.${rawAssetId}`),
    // need to sub to logged in as view does NOT remount forcing a query reload (we have to do it ourselves)
    [rawAssetId, isLoggedIn]
  )
  const [isLoadingAsset, isError, results, , hydrate] = useDataStore<
    FullAsset[]
  >(getQuery, 'asset-overview')
  const asset = results && results.length ? results[0] : null
  const assetId = asset ? asset.id : rawAssetId
  const classes = useStyles()
  const [, , user] = useUserRecord()
  useBanner(asset && asset.bannerurl)
  // store as ref to avoid re-drawing each re-render
  const sizesRefs = useRef([
    getRandomInt(200, 300),
    getRandomInt(200, 300),
    getRandomInt(200, 300)
  ])
  const [isPedestalExpanded, setIsPedestalExpanded] = useState(false)

  const isAllowedToEditAsset = asset && user && getCanUserEditAsset(asset, user)

  const urlToAsset = routes.viewAssetWithVar.replace(':assetId', assetId)

  if (isError || (results && results.length === 0)) {
    return (
      <ErrorMessage>
        We failed to load that asset. you could not have permission or maybe it
        does not exist. Please ask our staff on Discord
      </ErrorMessage>
    )
  }

  const isLoading = isLoadingAsset || !asset
  const attachedImagesAndYouTubeUrls =
    asset && asset.fileurls && asset.fileurls.length
      ? asset.fileurls.filter(
          url => isUrlAnImage(url) || isUrlAYoutubeVideo(url)
        )
      : []

  return (
    <>
      <AssetOverviewContext.Provider
        value={{
          assetId,
          asset,
          isLoading,
          trackAction: (action: string, payload: any) =>
            trackAction(analyticsCategoryName, action, payload),
          hydrate,
          analyticsCategoryName
        }}>
        {isLoading ? (
          <Helmet>
            <title>Loading asset... | VRCArena</title>
          </Helmet>
        ) : (
          <Helmet>
            <title>
              {asset.title || '(no title)'}{' '}
              {asset.authorname ? ` | By ${asset.authorname} | ` : ' | '}
              VRCArena
            </title>
            <meta
              name="description"
              content={getDescriptionForHtmlMeta(asset.description)}
            />
            <meta property="og:title" content={asset.title} />
            <meta property="og:type" content="website" />
            <meta
              property="og:description"
              content={getDescriptionForHtmlMeta(asset.description)}
            />
            <meta
              property="og:url"
              content={getOpenGraphUrlForRouteUrl(
                routes.viewAssetWithVar.replace(
                  ':assetId',
                  asset.slug || assetId
                )
              )}
            />
            <meta property="og:image" content={asset.thumbnailurl} />
            <meta property="og:site_name" content="VRCArena" />
          </Helmet>
        )}
        <Messages />
        {asset && asset.pedestalvideourl ? (
          <div
            className={`${classes.pedestalWrapper} ${
              isPedestalExpanded ? classes.expanded : ''
            }`}
            onClick={() => setIsPedestalExpanded(currentVal => !currentVal)}>
            <PedestalVideo
              videoUrl={asset.pedestalvideourl}
              fallbackImageUrl={asset.pedestalfallbackimageurl}
            />
          </div>
        ) : isLoading || attachedImagesAndYouTubeUrls.length ? (
          <ImageGallery
            urls={isLoading ? [] : attachedImagesAndYouTubeUrls}
            thumbnailUrls={
              isLoading
                ? [
                    <LoadingShimmer height={sizesRefs.current[0]} />,
                    <LoadingShimmer height={sizesRefs.current[1]} />,
                    <LoadingShimmer height={sizesRefs.current[2]} />
                  ]
                : attachedImagesAndYouTubeUrls.slice(0, 3)
            }
            onOpen={() =>
              trackAction(
                analyticsCategoryName,
                'Click attached image thumbnail to open gallery'
              )
            }
            onMoveNext={() =>
              trackAction(
                analyticsCategoryName,
                'Click go next image in gallery'
              )
            }
            onMovePrev={() =>
              trackAction(
                analyticsCategoryName,
                'Click go prev image in gallery'
              )
            }
            wrap={false}
            className={classes.primaryImageGallery}
            isStatic={isLoading}
            minHeight={sizesRefs.current[0]}
          />
        ) : asset ? (
          <div className={classes.thumbnailWrapper}>
            <AssetThumbnail url={asset.thumbnailurl} />
          </div>
        ) : null}
        <div className={classes.primaryMetadata}>
          <div>
            <Heading variant="h1" noMargin className={classes.titleAndAuthor}>
              {isLoading ? (
                <LoadingShimmer width={300} height={50} />
              ) : (
                <>
                  <Link to={urlToAsset}>{asset.title}</Link>
                  <NsfwIcon />
                </>
              )}
              {isLoading || asset.authorname ? (
                <span className={classes.authorName}>
                  {' '}
                  {isLoading ? (
                    <LoadingShimmer width={200} height={30} />
                  ) : (
                    <>
                      by{' '}
                      <Link
                        to={routes.viewAuthorWithVar.replace(
                          ':authorId',
                          asset.author
                        )}>
                        {asset.authorname}
                      </Link>
                    </>
                  )}
                </span>
              ) : null}
            </Heading>
            {isLoading ? (
              <LoadingShimmer width={200} height={25} />
            ) : (
              <>
                <SpeciesList
                  speciesIds={asset.species ? asset.species : []}
                  speciesNames={asset.speciesnames ? asset.speciesnames : []}
                />
                {asset.species && asset.species.length ? ' / ' : ''}

                {isEditor &&
                  asset.ranks &&
                  insertItemInbetweenAllItems(
                    asset.ranks.map(rank => {
                      const rankDetails = getRankById(rank)
                      return rankDetails ? (
                        <Link
                          key={rank}
                          to={routes.viewRankWithVar.replace(':rankId', rank)}>
                          R: {rankDetails.canonicalName}
                        </Link>
                      ) : (
                        <span key={rank}>{rank}</span>
                      )
                    }),
                    <> / </>
                  )}

                {isEditor && asset.ranks && asset.ranks.length ? ' / ' : ''}
                <Link
                  to={routes.viewCategoryWithVar.replace(
                    ':categoryName',
                    asset.category
                  )}>
                  {asset.category
                    ? categoryMeta[asset.category].nameSingular
                    : '(no category)'}
                </Link>
              </>
            )}
          </div>
        </div>
        <div className={classes.cols}>
          <div className={classes.leftCol}>
            <TabDescription />
            {attachedImagesAndYouTubeUrls.length > 3 && (
              <Area name="extra-attached-images" label="Images">
                <ImageGallery
                  urls={isLoading ? [] : attachedImagesAndYouTubeUrls.slice(3)}
                  thumbnailUrls={
                    isLoading
                      ? [
                          <LoadingShimmer height={300} />,
                          <LoadingShimmer height={300} />,
                          <LoadingShimmer height={300} />
                        ]
                      : attachedImagesAndYouTubeUrls.slice(3)
                  }
                  onOpen={() =>
                    trackAction(
                      analyticsCategoryName,
                      'Click attached image thumbnail to open gallery'
                    )
                  }
                  onMoveNext={() =>
                    trackAction(
                      analyticsCategoryName,
                      'Click go next image in gallery'
                    )
                  }
                  onMovePrev={() =>
                    trackAction(
                      analyticsCategoryName,
                      'Click go prev image in gallery'
                    )
                  }
                  wrap={false}
                  isStatic={isLoading}
                  minHeight={300}
                />
              </Area>
            )}
            {asset ? (
              <>
                {asset &&
                (asset.category === AssetCategories.avatar ||
                  (asset.vrchatclonableavatarids &&
                    asset.vrchatclonableavatarids.length)) ? (
                  <Area
                    name="avatars"
                    label={`Avatars${
                      asset &&
                      asset.vrchatclonableavatarids !== null &&
                      asset.vrchatclonableavatarids.length >= 0
                        ? ` (${asset.vrchatclonableavatarids.length})`
                        : ''
                    }`}>
                    <TabAvatars />
                  </Area>
                ) : null}
                <Area
                  name="comments"
                  label={`Comments${
                    asset && asset.commentcount >= 0
                      ? ` (${asset.commentcount})`
                      : ''
                  }`}>
                  <TabComments />
                </Area>
                <Area
                  name="reviews"
                  label={`Reviews${
                    asset && asset.reviewcount >= 0
                      ? ` (${asset.reviewcount})`
                      : ''
                  }`}>
                  <TabReviews />
                </Area>
                <Area name="attachments" label="User Content">
                  <TabAttachments />
                </Area>
                {asset && asset.relations && asset.relations.length ? (
                  <Area name="relations">
                    <Relations relations={asset.relations} />
                  </Area>
                ) : null}
                <Area name="related" label="Related Assets">
                  <TabRelated />
                </Area>
                {asset.isopenforcommission &&
                asset.showcommissionstatusforassets ? (
                  <Area name="commissions" label="Commission Info">
                    <OpenForCommissionsMessage
                      info={asset.commissioninfo}
                      authorId={asset.author}
                    />
                  </Area>
                ) : null}
                {isEditor ? (
                  <Area name="admin" label="Admin">
                    <TabAdmin />
                  </Area>
                ) : null}
              </>
            ) : null}
          </div>
          <div className={classes.rightCol}>
            {isLoading ||
            (asset && (asset.priceusd || getIsAssetFree(asset.tags))) ? (
              <ControlGroup>
                <Control>
                  <Price
                    isLoading={isLoading}
                    priceUsd={
                      isLoading
                        ? 123.45
                        : getIsAssetFree(asset.tags)
                        ? 0
                        : asset.priceusd
                    }
                  />
                </Control>
              </ControlGroup>
            ) : null}
            {asset &&
            asset.fileurls &&
            asset.fileurls
              .filter(isUrlNotAnImageOrVideo)
              .filter(url => !isUrlAYoutubeVideo(url)).length ? (
              <ControlGroup>
                <Control>
                  <Button
                    url={asset.fileurls
                      .filter(isUrlNotAnImageOrVideo)
                      .filter(url => !isUrlAYoutubeVideo(url))
                      .shift()}>
                    Download
                  </Button>
                </Control>
              </ControlGroup>
            ) : null}
            {isLoading || (asset && asset.sourceurl) ? (
              <ControlGroup>
                <Control>
                  {asset && asset.sourceurl && isGitHubUrl(asset.sourceurl) ? (
                    <GitHubReleases
                      gitHubUrl={asset.sourceurl}
                      showErrorOnNotFound={false}
                    />
                  ) : null}
                  <VisitSourceButton
                    isAssetLoading={isLoading}
                    assetId={assetId}
                    isNoFilesAttached
                    sourceUrl={asset ? asset.sourceurl : null}
                    categoryName={asset ? asset.category : null}
                    analyticsCategoryName={analyticsCategoryName}
                    analyticsEvent="Click visit source button"
                  />
                  <RiskyFileNotice sourceUrl={asset ? asset.sourceurl : ''} />
                  <DiscordServerInfo />
                  <MiniSaleInfo />
                </Control>
              </ControlGroup>
            ) : null}
            <AssetFeatures tags={asset ? asset.tags : []} shimmer={isLoading} />
            <ParentControlGroup />
            <ControlGroup>
              {asset && asset.category === AssetCategories.avatar && (
                <>
                  <Control>
                    <Button
                      url={routes.avatarTutorial}
                      color="default"
                      icon={<BuildIcon />}
                      isLoading={isLoading}>
                      Avatar Tutorial
                    </Button>
                  </Control>
                  <Control>
                    <Button
                      url={routes.accessorizeWithVar.replace(
                        ':assetId',
                        assetId
                      )}
                      color="default"
                      icon={<AccessibilityNewIcon />}
                      isLoading={isLoading}>
                      Find Accessories
                    </Button>
                  </Control>
                </>
              )}
              {asset &&
              asset.vrchatclonableworldids &&
              asset.vrchatclonableworldids.length ? (
                <>
                  <Control>
                    <Button
                      url={getUrlForVrChatWorldId(
                        asset.vrchatclonableworldids[0]
                      )}
                      onClick={() =>
                        trackAction(
                          analyticsCategoryName,
                          'Click view world on VRChat website button',
                          assetId
                        )
                      }
                      icon={
                        <span className={classes.vrchatIcon}>
                          <VRChatIcon />
                        </span>
                      }>
                      View VRChat Website
                    </Button>
                  </Control>
                  <Control>
                    <Button
                      url={getVrchatWorldLaunchUrlForId(
                        asset.vrchatclonableworldids[0]
                      )}
                      onClick={() =>
                        trackAction(
                          analyticsCategoryName,
                          'Click launch VRChat world button',
                          assetId
                        )
                      }
                      icon={
                        <span className={classes.vrchatIcon}>
                          <VRChatIcon />
                        </span>
                      }
                      color="default">
                      Launch VRChat
                    </Button>
                  </Control>
                </>
              ) : null}
              <Control>
                <EndorseAssetButton
                  isAssetLoading={isLoading}
                  assetId={assetId}
                  endorsementCount={
                    asset ? asset.endorsementcount : 'Loading...'
                  }
                  onClick={({ newValue }) =>
                    trackAction(
                      analyticsCategoryName,
                      newValue === true
                        ? 'Click endorse button'
                        : 'Click disendorse button',
                      assetId
                    )
                  }
                  onDone={() => {
                    hydrate()
                  }}
                />
              </Control>
              <Control>
                <AddToCollectionButton
                  isAssetLoading={isLoading}
                  assetId={assetId}
                  onClick={({ newValue }) =>
                    trackAction(
                      analyticsCategoryName,
                      newValue === true
                        ? 'Click add to collection button'
                        : 'Click remove from collection button',
                      assetId
                    )
                  }
                />
              </Control>
              <Control>
                <AddToWishlistButton
                  isAssetLoading={isLoading}
                  assetId={assetId}
                  onClick={({ newValue }) =>
                    trackAction(
                      analyticsCategoryName,
                      newValue === true
                        ? 'Click add to wishlist button'
                        : 'Click remove from wishlist button',
                      assetId
                    )
                  }
                />
              </Control>
              <Control>
                <AddToCartButton
                  isLoading={isLoading}
                  assetId={assetId}
                  asButton
                />
              </Control>
            </ControlGroup>
            {isLoggedIn && (
              <ControlGroup>
                <LoggedInControls />
              </ControlGroup>
            )}
            {isAllowedToEditAsset || isEditor ? (
              <ControlGroup>
                <CreatorControls />
              </ControlGroup>
            ) : null}
            {isEditor && (
              <ControlGroup>
                <EditorControls />
              </ControlGroup>
            )}
            <ControlGroup>
              <TagChips
                tags={asset && asset.tags}
                shimmer={isLoading}
                isFilled={false}
              />
            </ControlGroup>
            {isEditor && (
              <ControlGroup>
                {asset && asset.createdat ? (
                  <div>
                    Uploaded <FormattedDate date={asset.createdat} /> by{' '}
                    {asset.createdbyusername ? (
                      <UsernameLink
                        id={asset.createdby}
                        username={asset.createdbyusername}
                      />
                    ) : (
                      '(unknown)'
                    )}
                  </div>
                ) : null}
                {asset && asset.lastmodifiedby ? (
                  <div>
                    Last modified <FormattedDate date={asset.lastmodifiedat} />{' '}
                    by{' '}
                    {asset.lastmodifiedbyusername ? (
                      <UsernameLink
                        id={asset.lastmodifiedby}
                        username={asset.lastmodifiedbyusername}
                      />
                    ) : (
                      '(unknown)'
                    )}
                  </div>
                ) : null}
                {asset && asset.lastsyncedwithgumroadat ? (
                  <div>
                    Last synced with Gumroad{' '}
                    <FormattedDate date={asset.lastsyncedwithgumroadat} />
                  </div>
                ) : null}
              </ControlGroup>
            )}
          </div>
        </div>
      </AssetOverviewContext.Provider>
    </>
  )
}
