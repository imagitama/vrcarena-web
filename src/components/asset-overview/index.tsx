import React, { Suspense, useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { Helmet } from 'react-helmet'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'

// icons
import BuildIcon from '@mui/icons-material/Build'
import LoyaltyIcon from '@mui/icons-material/Loyalty'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import LinkIcon from '@mui/icons-material/Link'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import { Warning as WarningIcon } from '../../icons'

import useBanner from '../../hooks/useBanner'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import useIsEditor from '../../hooks/useIsEditor'
import useUserRecord from '../../hooks/useUserRecord'
import {
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  getIsGitHubUrl,
  getIsUrlRisky,
  getIsUuid,
  scrollToTop,
} from '../../utils'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '../../media-queries'
import Link from '../../components/link'
import { getCategoryMeta } from '../../category-meta'
import {
  AssetCategory,
  FullAsset,
  FunctionNames,
  GetFullAssetCacheItem,
  RelationType,
  SourceInfo,
  ViewNames,
  getIsAssetADraft,
  getIsAssetWaitingForApproval,
} from '../../modules/assets'

import AssetThumbnail from '../asset-thumbnail'
import Heading from '../heading'
import ErrorMessage from '../error-message'
import LoadingShimmer from '../loading-shimmer'
import ImageGallery from '../image-gallery'
import FeatureList from '../feature-list'
import TagChips from '../tag-chips'
import Button from '../button'
import AssetResultsItem from '../asset-results-item'
import FormattedDate from '../formatted-date'
import UsernameLink from '../username-link'
import GitHubReleases from '../github-releases'

// controls
import VisitSourceButton from '../visit-source-button'
import EndorseAssetButton from '../endorse-asset-button'
import AddToWishlistButton from '../add-to-wishlist-button'
import AddToCollectionButton from '../add-to-collection-button'

import AssetOverviewContext from './context'
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
import SpeciesList from '../species-list'

import Relations from '../relations'
import useAssetOverview from './useAssetOverview'
import OpenForCommissionsMessage from '../open-for-commissions-message'
import TabMentions from './components/tab-mentions'
import VrcFurySettings from '../vrcfury-settings'
import DiscordServerMustJoinNotice from '../discord-server-must-join-notice'
import Block from '../block'
import Questions from '../questions'
import { AttachmentType } from '../../modules/attachments'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import WarningMessage from '../warning-message'
import { alreadyOver18Key } from '../../config'
import useStorage from '../../hooks/useStorage'
import AddToVccButton from '../add-to-vcc-button'
import { AccessStatus } from '../../modules/common'
import { tagVrcFuryReady } from '../../vrcfury'
import RequiresVerificationNotice from '../requires-verification-notice'
import HintText from '../hint-text'
import { getVrchatWorldLaunchUrlForId } from '../../vrchat'
import useDataStoreFunction from '../../hooks/useDataStoreFunction'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import LoadingIndicator from '../loading-indicator'
import { getHasPermissionForRecord } from '../../permissions'

const LoggedInControls = React.lazy(
  () =>
    import(
      /* webpackChunkName: "asset-overview-logged-in-controls" */ './components/logged-in-controls'
    )
)
const EditorControls = React.lazy(
  () =>
    import(
      /* webpackChunkName: "asset-overview-editor-controls" */ './components/editor-controls'
    )
)
const CreatorControls = React.lazy(
  () =>
    import(
      /* webpackChunkName: "asset-overview-creator-controls" */ './components/creator-controls'
    )
)
const QueuedAssetInfo = React.lazy(
  () =>
    import(
      /* webpackChunkName: "asset-overview-queued-asset-info" */ '../queued-asset-info'
    )
)

const useStyles = makeStyles({
  // columns
  cols: {
    maxWidth: '100vw',
    display: 'flex',
    flexDirection: 'row',

    [mediaQueryForMobiles]: {
      flexDirection: 'column-reverse',
    },
  },
  leftCol: {
    paddingTop: '1rem',
    width: '100%',
    minWidth: 0, // fix flex shrink issue
  },
  rightCol: {
    maxWidth: '300px',
    flexShrink: 0,
    marginLeft: '1rem',
    [mediaQueryForMobiles]: {
      width: '100%',
      margin: '2rem 0 0',
    },
  },
  // content
  pedestalWrapper: {
    width: '25%',
    margin: '0 auto',
    cursor: 'pointer',
    transition: 'all 200ms',
    [mediaQueryForTabletsOrBelow]: {
      width: '50%',
    },
    [mediaQueryForMobiles]: {
      width: '100%',
    },
  },
  expanded: {
    width: '60%',
    [mediaQueryForTabletsOrBelow]: {
      width: '80%',
    },
    [mediaQueryForMobiles]: {
      width: '100%',
    },
  },
  authorName: {
    fontSize: '50%',
  },
  primaryImageGallery: {
    marginBottom: '1rem',
  },
  primaryMetadata: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '1rem',

    [mediaQueryForMobiles]: {
      flexDirection: 'column',
    },
  },
  primaryMetadataThumb: {
    marginRight: '1rem',
  },
  thumbnailWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  titleAndAuthor: {
    marginBottom: '0.5rem',
  },
  // controls
  controlGroup: {
    marginBottom: '1rem',
  },
  // parent
  parent: {
    margin: '2rem 0',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  },
  parentWrapper: {
    position: 'relative',
  },
  vrchatIcon: {
    fontSize: '200%',
    display: 'flex',
  },
  riskyFileNotice: {
    fontSize: '75%',
    padding: '0.25rem 0',
    '& svg': {
      fontSize: '100%',
    },
  },
  miniSaleInfo: {
    marginTop: '0.5rem',
    textAlign: 'center',
    '& a': {
      display: 'block',
      padding: '1rem',
      color: 'inherit',
    },
  },
  saleTitle: {
    fontSize: '150%',
    marginBottom: '0.25rem',
  },
})

const ParentControlGroup = () => {
  const { asset } = useAssetOverview()
  const classes = useStyles()

  const relation =
    asset &&
    asset.relations &&
    asset.relations.find((relation) => relation.type === RelationType.Parent)

  if (!relation) {
    return null
  }

  const parentData = asset.relationsdata.find(
    (asset) => asset.id === relation.asset
  )

  if (!parentData) {
    return null
  }

  return (
    <ControlGroup>
      <div className={classes.parent}>
        <div className={classes.parentWrapper}>
          <AssetResultsItem asset={parentData} relation={relation} />
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

const analyticsCategoryName = 'ViewAsset'

const RiskyFileNotice = ({ sourceUrl }: { sourceUrl?: string }) => {
  const classes = useStyles()

  if (!sourceUrl || (sourceUrl && !getIsUrlRisky(sourceUrl))) {
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
    (asset.saleexpiresat && new Date(asset.saleexpiresat) < new Date())
  ) {
    return null
  }

  return (
    <Card className={classes.miniSaleInfo}>
      <CardActionArea>
        <Link to={routes.viewAuthorWithVar.replace(':authorId', asset.author)}>
          <div className={classes.saleTitle}>Sale!</div>
          Click here to view the author's sale info
        </Link>
      </CardActionArea>
    </Card>
  )
}

const Area = ({
  name,
  label,
  children,
}: {
  name: string
  label?: string
  children: React.ReactNode
}) => {
  const { assetId, asset } = useAssetOverview()

  return (
    <Suspense fallback={<LoadingIndicator message="Loading area..." />}>
      <Block
        url={routes.viewAssetWithVarAndTabVar
          .replace(':assetId', asset && asset.slug ? asset.slug : assetId)
          .replace(':tabName', name)}
        title={label}
        icon={<LinkIcon />}>
        {children}
      </Block>
    </Suspense>
  )
}

const AssetOverview = ({ assetId: rawAssetId }: { assetId: string }) => {
  const isLoggedIn = useIsLoggedIn()
  const isEditor = useIsEditor()
  const isSlug = getIsUuid(rawAssetId) === false && rawAssetId.includes('-')

  const [
    isLoadingCachedAsset,
    lastErrorCodeCached,
    cacheResults,
    hydrateCachedAsset,
  ] = useDataStoreFunction<{ slug_to_search: string }, GetFullAssetCacheItem>(
    isSlug ? FunctionNames.GetOrHydrateGetFullAssets : false,
    true,
    {
      slug_to_search: rawAssetId,
    }
  )
  const [
    isLoadingNonCachedAsset,
    lastErrorCodeNonCached,
    nonCachedResults,
    hydrateNonCachedAsset,
  ] = useDataStoreItem<FullAsset>(
    ViewNames.GetFullAssets,
    isSlug ? false : rawAssetId,
    'asset-overview'
  )

  const hydrate = isSlug ? hydrateCachedAsset : hydrateNonCachedAsset

  const cachedRecord =
    isSlug && Array.isArray(cacheResults) ? cacheResults[0] : null
  const asset: FullAsset | null = cachedRecord
    ? cachedRecord.data
    : isSlug
    ? null
    : nonCachedResults
    ? nonCachedResults
    : null
  const assetId = asset ? asset.id : rawAssetId

  console.debug('asset-overview.render', {
    rawAssetId,
    isSlug,
    cachedRecord,
    cacheResults,
    nonCachedResults,
    asset,
  })

  const classes = useStyles()
  const [, , user] = useUserRecord()
  useBanner(asset && asset.bannerurl ? asset.bannerurl : null)
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [bypassAdultFilterOnce, setBypassAdultFilterOnce] = useState(false)
  const [, setIsAlreadyOver18] = useStorage(alreadyOver18Key)

  const hideBecauseAdult =
    asset && asset.isadult && !isAdultContentEnabled && !bypassAdultFilterOnce

  const bannerUrl = hideBecauseAdult
    ? null
    : asset
    ? asset.bannerurl
      ? asset.bannerurl
      : asset.attachmentsdata && asset.attachmentsdata.length
      ? asset.attachmentsdata[0].url
      : null
    : null

  useBanner(bannerUrl)

  const urlToAsset = routes.viewAssetWithVar.replace(
    ':assetId',
    asset && asset.slug ? asset.slug : assetId
  )

  const isLoading =
    (isSlug && isLoadingCachedAsset) ||
    (!isSlug && isLoadingNonCachedAsset) ||
    !asset

  useEffect(() => {
    console.debug('asset loaded, scrolling to top...')
    scrollToTop()
  }, [asset ? asset.id : undefined])

  if (
    lastErrorCodeCached !== null ||
    lastErrorCodeNonCached !== null ||
    (asset &&
      ((asset.category as string) === 'world' ||
        (asset.category as string) === 'article'))
  ) {
    return (
      <ErrorMessage>
        Failed to load asset. It could have been deleted, never existed or you
        do not have permission to see it. If you think this is wrong please
        contact us in Discord.
      </ErrorMessage>
    )
  }

  if (hideBecauseAdult) {
    return (
      <WarningMessage
        title="Adult Content Warning"
        controls={[
          <Button
            color="secondary"
            onClick={() => setBypassAdultFilterOnce(true)}>
            I am over 18 - Allow Once
          </Button>,
          <Button color="secondary" onClick={() => setIsAlreadyOver18(true)}>
            I am over 18 - Allow In Browser
          </Button>,
        ]}>
        "{asset.title}" contains adult content and is hidden by default. You can
        disable this by going to{' '}
        <Link
          to={routes.myAccountWithTabNameVar.replace(':tabName', 'settings')}>
          your account settings
        </Link>
        , just this once, or forever in this browser.
        <br />
        <br />
        Tags for this asset: <TagChips tags={asset.tags} isFilled={false} />
      </WarningMessage>
    )
  }

  const mediaAttachments =
    asset && asset.attachmentsdata
      ? asset.attachmentsdata.filter(
          (attachment) => attachment.type !== AttachmentType.File
        )
      : []
  const nonMediaAttachments =
    asset && asset.attachmentsdata
      ? asset.attachmentsdata.filter(
          (attachment) => attachment.type === AttachmentType.File
        )
      : []
  const firstFileAttachment =
    asset && asset.attachmentsdata
      ? asset.attachmentsdata.find(
          (attachment) => attachment.type === AttachmentType.File
        )
      : undefined

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
          analyticsCategoryName,
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
            {asset.accessstatus === AccessStatus.Archived ? (
              <meta name="robots" content="noindex" />
            ) : null}
          </Helmet>
        )}
        {asset && getIsAssetWaitingForApproval(asset) ? (
          <Suspense
            fallback={<LoadingIndicator message="Loading component..." />}>
            <QueuedAssetInfo asset={asset} hydrate={hydrate} />
          </Suspense>
        ) : null}
        <Messages />
        <ImageGallery
          images={
            isLoading
              ? []
              : mediaAttachments.length
              ? mediaAttachments.slice(0, 3).map((attachment) => ({
                  url: attachment.url,
                }))
              : [
                  {
                    url: asset.thumbnailurl,
                  },
                ]
          }
          onClickImage={() =>
            trackAction(
              analyticsCategoryName,
              'Click attached image thumbnail to open gallery'
            )
          }
          onMoveNext={() =>
            trackAction(analyticsCategoryName, 'Click go next image in gallery')
          }
          onMovePrev={() =>
            trackAction(analyticsCategoryName, 'Click go prev image in gallery')
          }
          showLoadingCount={isLoading ? 3 : 0}
        />
        <div className={classes.primaryMetadata}>
          <div className={classes.primaryMetadataThumb}>
            {isLoading ? (
              <LoadingShimmer width={75} height={75} />
            ) : (
              <AssetThumbnail url={asset.thumbnailurl} size="micro" alt="" />
            )}
          </div>
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
                {asset.category === AssetCategory.Avatar ? (
                  <>
                    <SpeciesList
                      speciesIds={asset.species ? asset.species : []}
                      speciesNames={
                        asset.speciesnames ? asset.speciesnames : []
                      }
                    />
                    {asset.species && asset.species.length ? ' / ' : ''}
                  </>
                ) : null}
                <Link
                  to={routes.viewCategoryWithVar.replace(
                    ':categoryName',
                    asset.category
                  )}>
                  {asset.category
                    ? getCategoryMeta(asset.category).nameSingular
                    : '(no category)'}
                </Link>
              </>
            )}
          </div>
        </div>
        <div className={classes.cols}>
          <div className={classes.leftCol}>
            <TabDescription />
            {nonMediaAttachments.length > 3 && (
              <Area name="extra-attached-images" label="Images">
                <ImageGallery
                  images={
                    isLoading
                      ? []
                      : nonMediaAttachments
                          .slice(3)
                          .map((attachment) => ({ url: attachment.url }))
                  }
                  onClickImage={() =>
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
                />
              </Area>
            )}
            {asset ? (
              <>
                {asset &&
                (asset.category === AssetCategory.Avatar ||
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
                <Area name="questions" label="Community Questions">
                  <Questions assetId={asset.id} />
                </Area>
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
                <Area name="mentions" label="Relations">
                  <TabMentions />
                </Area>
                {isEditor ? (
                  <Area name="admin" label="Admin">
                    <TabAdmin />
                  </Area>
                ) : null}
              </>
            ) : null}
          </div>
          <div className={classes.rightCol}>
            {asset && asset.vccurl ? (
              <ControlGroup>
                <Control>
                  <AddToVccButton vccUrl={asset.vccurl} />
                </Control>
              </ControlGroup>
            ) : null}
            {firstFileAttachment ? (
              <ControlGroup>
                <Control>
                  <Button url={firstFileAttachment.url}>Download</Button>
                </Control>
              </ControlGroup>
            ) : null}
            {isLoading || (asset && asset.sourceurl) ? (
              <ControlGroup>
                {asset?.relations?.find(
                  (relation) => relation.requiresVerification
                ) ? (
                  <Control>
                    <RequiresVerificationNotice
                      relations={asset.relations}
                      relationsData={asset.relationsdata}
                    />
                  </Control>
                ) : null}
                {asset?.discordserver ? (
                  <Control>
                    <DiscordServerMustJoinNotice
                      discordServerId={asset?.discordserver}
                      discordServerData={asset?.discordserverdata || undefined}
                    />
                  </Control>
                ) : null}

                {asset && asset.sourceurl && getIsGitHubUrl(asset.sourceurl) ? (
                  <Control>
                    <GitHubReleases
                      gitHubUrl={asset.sourceurl}
                      showErrorOnNotFound={false}
                    />
                  </Control>
                ) : null}

                {asset ? (
                  [
                    {
                      url: asset.sourceurl,
                      price: asset.price,
                      pricecurrency: asset.pricecurrency,
                    } as SourceInfo,
                  ]
                    .concat(asset.extrasources || []) // TODO: Ensure data is always empty array
                    .map((sourceInfo) => (
                      <Control key={sourceInfo.url}>
                        <VisitSourceButton
                          sourceInfo={sourceInfo}
                          // analytics
                          analyticsCategoryName={analyticsCategoryName}
                          assetId={assetId}
                        />
                      </Control>
                    ))
                ) : (
                  <Control>
                    <VisitSourceButton isAssetLoading />
                  </Control>
                )}

                <HintText>
                  *prices are an indication only and may be outdated
                </HintText>

                <Control>
                  <RiskyFileNotice sourceUrl={asset ? asset.sourceurl : ''} />
                  <MiniSaleInfo />
                </Control>
                <Control>
                  {asset &&
                    ((asset.extradata &&
                      asset.extradata.vrcfury &&
                      asset.extradata.vrcfury.prefabs.length) ||
                      asset.tags.includes(tagVrcFuryReady)) && (
                      <VrcFurySettings
                        isVrcFuryReady={asset.tags.includes(tagVrcFuryReady)}
                        prefabs={asset.extradata?.vrcfury?.prefabs}
                        analyticsCategory={analyticsCategoryName}
                      />
                    )}
                </Control>
              </ControlGroup>
            ) : null}
            <FeatureList
              tags={asset ? asset.tags : []}
              existingTagsData={asset ? asset.tagsdata : []}
              shimmer={isLoading}
            />
            <ParentControlGroup />
            <ControlGroup>
              {asset && asset.category === AssetCategory.Avatar && (
                <>
                  <Control>
                    <Button
                      url={routes.avatarTutorial}
                      color="secondary"
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
                      color="secondary"
                      icon={<AccessibilityNewIcon />}
                      isLoading={isLoading}>
                      Find Accessories
                    </Button>
                  </Control>
                </>
              )}
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
              <Control>
                <Button
                  url={routes.compareWithVar.replace(':assetId', assetId)}
                  icon={<CompareArrowsIcon />}
                  color="secondary">
                  Compare
                </Button>
              </Control>
            </ControlGroup>
            {isLoggedIn && (
              <ControlGroup>
                <Suspense
                  fallback={<LoadingIndicator message="Loading controls..." />}>
                  <LoggedInControls />
                </Suspense>
              </ControlGroup>
            )}
            {asset &&
            getHasPermissionForRecord<FullAsset>(
              user,
              asset,
              getIsAssetADraft(asset)
            ) ? (
              <ControlGroup>
                <Suspense
                  fallback={<LoadingIndicator message="Loading controls..." />}>
                  <CreatorControls />
                </Suspense>
              </ControlGroup>
            ) : null}
            {isEditor && (
              <ControlGroup>
                <Suspense
                  fallback={<LoadingIndicator message="Loading controls..." />}>
                  <EditorControls />
                </Suspense>
              </ControlGroup>
            )}
            <ControlGroup>
              <TagChips
                tags={asset ? asset.tags : []}
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
                {asset && asset.approvedat ? (
                  <div>
                    Approved <FormattedDate date={asset.approvedat} /> by{' '}
                    {asset.approvedby && asset.approvedbyusername ? (
                      <UsernameLink
                        id={asset.approvedby}
                        username={asset.approvedbyusername}
                      />
                    ) : asset.approvedby ? (
                      asset.approvedby
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
                {cachedRecord && (
                  <>
                    Cached <FormattedDate date={cachedRecord.updatedat} />
                  </>
                )}
              </ControlGroup>
            )}
          </div>
        </div>
      </AssetOverviewContext.Provider>
    </>
  )
}

export default AssetOverview
