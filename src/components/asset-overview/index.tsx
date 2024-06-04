import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'

// icons
import BuildIcon from '@material-ui/icons/Build'
import LoyaltyIcon from '@material-ui/icons/Loyalty'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
import LinkIcon from '@material-ui/icons/Link'
import AccessibilityNewIcon from '@material-ui/icons/AccessibilityNew'
import WarningIcon from '@material-ui/icons/Warning'

import useDataStore from '../../hooks/useDataStore'
import useBanner from '../../hooks/useBanner'
import { client as supabase } from '../../supabase'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import useIsEditor from '../../hooks/useIsEditor'
import useUserRecord from '../../hooks/useUserRecord'
import {
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  isGitHubUrl,
  isGoogleDriveUrl,
  isTwitterUrl,
  isDiscordUrl,
} from '../../utils'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '../../media-queries'
import { getCanUserEditAsset } from '../../assets'
import Link from '../../components/link'
import { ReactComponent as VRChatIcon } from '../../assets/images/icons/vrchat.svg'
import categoryMeta from '../../category-meta'
import {
  AssetCategory,
  FullAsset,
  RelationType,
  ViewNames,
} from '../../modules/assets'

import AssetThumbnail from '../asset-thumbnail'
import Heading from '../heading'
import ErrorMessage from '../error-message'
import LoadingShimmer from '../loading-shimmer'
import ImageGallery from '../image-gallery'
import FeatureList from '../feature-list'
import PedestalVideo from '../pedestal-video'
import Price from '../price'
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
import { getUrlForVrChatWorldId } from '../../social-media'
import SpeciesList from '../species-list'

import Relations from '../relations'
import useAssetOverview from './useAssetOverview'
import OpenForCommissionsMessage from '../open-for-commissions-message'
import TabMentions from './components/tab-mentions'
import AssetResultsItemParent from '../asset-results-item-parent'
import VrcFurySettings from '../vrcfury-settings'
import DiscordServerMustJoinNotice from '../discord-server-must-join-notice'
import Block from '../block'
import Questions from '../questions'
import { AttachmentType } from '../../modules/attachments'

// controls
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

const useStyles = makeStyles((theme) => ({
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
}))

const ParentControlGroup = () => {
  const { asset } = useAssetOverview()
  const classes = useStyles()

  const parent =
    asset &&
    asset.relations &&
    asset.relations.find((relation) => relation.type === RelationType.Parent)

  if (!parent) {
    return null
  }

  const parentData = asset.relationsdata.find(
    (relation) => relation.id === parent.asset
  )

  if (!parentData) {
    return null
  }

  return (
    <ControlGroup>
      <div className={classes.parent}>
        <div className={classes.parentWrapper}>
          <AssetResultsItemParent parent={parentData} />
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
    case AssetCategory.Avatar:
      return 'Accessories'
    default:
      return 'Linked Assets'
  }
}

const getVrchatWorldLaunchUrlForId = (worldId: string): string => {
  return `vrchat://launch?ref=vrchat.com&id=${worldId}:0`
}

const analyticsCategoryName = 'ViewAsset'

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
    <Block
      url={routes.viewAssetWithVarAndTabVar
        .replace(':assetId', asset && asset.slug ? asset.slug : assetId)
        .replace(':tabName', name)}
      title={label}
      icon={<LinkIcon />}>
      {children}
    </Block>
  )
}

const AssetOverview = ({ assetId: rawAssetId }: { assetId: string }) => {
  const isLoggedIn = useIsLoggedIn()
  const isEditor = useIsEditor()
  const getQuery = useCallback(
    () =>
      supabase
        .from(ViewNames.GetFullAssets)
        .select('*')
        // TODO: type safety field names
        .or(`id.eq.${rawAssetId},slug.eq.${rawAssetId}`)
        .limit(1),
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
  const [isPedestalExpanded, setIsPedestalExpanded] = useState(false)

  const isAllowedToEditAsset = asset && user && getCanUserEditAsset(asset, user)

  const urlToAsset = routes.viewAssetWithVar.replace(
    ':assetId',
    asset && asset.slug ? asset.slug : assetId
  )

  if (
    isError ||
    (results && results.length === 0) ||
    (asset && asset.category === 'world')
  ) {
    return (
      <ErrorMessage>
        We failed to load that asset. you could not have permission or maybe it
        does not exist. Please ask our staff on Discord
      </ErrorMessage>
    )
  }

  const isLoading = isLoadingAsset || !asset

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
          </Helmet>
        )}
        <Messages />
        {asset && asset.pedestalvideourl ? (
          <div
            className={`${classes.pedestalWrapper} ${
              isPedestalExpanded ? classes.expanded : ''
            }`}
            onClick={() => setIsPedestalExpanded((currentVal) => !currentVal)}>
            <PedestalVideo
              videoUrl={asset.pedestalvideourl}
              fallbackImageUrl={asset.pedestalfallbackimageurl}
            />
          </div>
        ) : (
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
            showLoadingCount={isLoading ? 3 : 0}
          />
        )}
        <div className={classes.primaryMetadata}>
          <div className={classes.primaryMetadataThumb}>
            {isLoading ? (
              <LoadingShimmer width={75} height={75} />
            ) : (
              <AssetThumbnail url={asset.thumbnailurl} size="micro" />
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
            {isLoading ||
            (asset && (asset.price || getIsAssetFree(asset.tags))) ? (
              <ControlGroup>
                <Control>
                  <Price
                    isLoading={isLoading}
                    price={
                      isLoading
                        ? 123.45
                        : getIsAssetFree(asset.tags)
                        ? 0
                        : asset.price
                    }
                    priceCurrency={asset ? asset.pricecurrency : 'USD'}
                  />
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
                    sourceInfo={
                      asset
                        ? {
                            url: asset.sourceurl,
                            price: null,
                            pricecurrency: null,
                            comments: '',
                          }
                        : undefined
                    }
                    analyticsCategoryName={analyticsCategoryName}
                    analyticsEvent="Click visit source button"
                    extraSources={asset?.extrasources}
                  />
                  <RiskyFileNotice sourceUrl={asset ? asset.sourceurl : ''} />
                  <MiniSaleInfo />
                </Control>
                {asset && asset.extrasources
                  ? asset.extrasources.map((sourceInfo) => (
                      <Control>
                        <VisitSourceButton
                          sourceInfo={sourceInfo}
                          assetId={assetId}
                          analyticsCategoryName={analyticsCategoryName}
                          analyticsEvent="Click visit extra source button"
                          isExtraSource
                        />
                      </Control>
                    ))
                  : null}
                <Control>
                  {asset?.discordserver ? (
                    <DiscordServerMustJoinNotice
                      discordServerId={asset?.discordserver}
                      discordServerData={asset?.discordserverdata || undefined}
                    />
                  ) : null}
                </Control>
                <Control>
                  {asset &&
                    asset.extradata &&
                    asset.extradata.vrcfury &&
                    asset.extradata.vrcfury.prefabs.length && (
                      <VrcFurySettings
                        prefabs={asset.extradata.vrcfury.prefabs}
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
              <Control>
                <Button
                  url={routes.compareWithVar.replace(':assetId', assetId)}
                  icon={<CompareArrowsIcon />}
                  color="default">
                  Compare
                </Button>
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
                    {asset.approvedbyusername ? (
                      <UsernameLink
                        id={asset.approvedby}
                        username={asset.approvedbyusername}
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

export default AssetOverview
