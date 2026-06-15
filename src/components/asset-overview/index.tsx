import React, { Suspense, useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { Helmet } from '@unhead/react/helmet'
import LoyaltyIcon from '@mui/icons-material/Loyalty'
import LinkIcon from '@mui/icons-material/Link'
import InfoIcon from '@mui/icons-material/Info'
import styled from '@emotion/styled'
import Typography from '@mui/material/Typography'

import { Warning as WarningIcon } from '@/icons'
import {
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  getIsGitHubUrl,
  getIsUrlRisky,
  getIsUuid,
  scrollToTop,
} from '@/utils'
import * as routes from '@/routes'
import { trackAction } from '@/analytics'
import {
  isMobile,
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
  mediaQueryForWideDesktops,
} from '@/media-queries'
import { getCategoryMeta } from '@/category-meta'
import {
  AssetCategory,
  FullAsset,
  RelationType,
  SourceInfo,
  ViewNames,
  getIsAssetADraft,
  getIsAssetWaitingForApproval,
} from '@/modules/assets'
import { getHasPermissionForRecord } from '@/permissions'
import { DataStoreErrorCode } from '@/data-store'
import { alreadyOver18Key } from '@/config'
import { AttachmentType } from '@/modules/attachments'
import { AccessStatus, ApprovalStatus } from '@/modules/common'
import { tagVrcFuryReady } from '@/vrcfury'

import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'
import useStorage from '@/hooks/useStorage'
import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'
import useIsLoggedIn from '@/hooks/useIsLoggedIn'
import useIsEditor from '@/hooks/useIsEditor'
import useUserRecord from '@/hooks/useUserRecord'
import { HydrateFn } from '@/hooks/useDataStore'

import AssetThumbnail from '@/components/asset-thumbnail'
import Heading from '@/components/heading'
import ErrorMessage from '@/components/error-message'
import LoadingShimmer from '@/components/loading-shimmer'
import ImageGallery from '@/components/image-gallery'
import TagChips from '@/components/tag-chips'
import Button from '@/components/button'
import AssetResultsItem from '@/components/asset-results-item'
import FormattedDate from '@/components/formatted-date'
import UsernameLink from '@/components/username-link'
import GitHubReleases from '@/components/github-releases'
import Link from '@/components/link'
import SpeciesList from '@/components/species-list'
import VisitSourceButton from '@/components/visit-source-button'
import EndorseAssetButton from '@/components/endorse-asset-button'
import AddToWishlistButton from '@/components/add-to-wishlist-button'
import AddToCollectionButton from '@/components/add-to-collection-button'

import useAssetOverview from './useAssetOverview'
import AssetOverviewContext from './context'
import Messages from './components/messages'
import TabDescription from './components/tab-description'
import TabReviews from './components/tab-reviews'
import TabComments from './components/tab-comments'
import TabAvatars from './components/tab-avatars'
import TabAdmin from './components/tab-admin'
import TabSimilar from './components/tab-similar'

import Relations from '@/components/relations'
import TabMentions from './components/tab-mentions'
import VrcFurySettings from '@/components/vrcfury-settings'
import DiscordServerMustJoinNotice from '@/components/discord-server-must-join-notice'
import Block from '@/components/block'
import WarningMessage from '@/components/warning-message'
import AddToVccButton from '@/components/add-to-vcc-button'
import RequiresVerificationNotice from '@/components/requires-verification-notice'
import LoadingIndicator from '@/components/loading-indicator'
import PrimaryImage from './components/primary-image'
import TagChip from '@/components/tag-chip'
import Tooltip from '../tooltip'
import { getFriendlyDate } from '@/utils/dates'
import { colorGreyedOut } from '@/themes'
import AssetTree, { FullAssetTree } from '../asset-tree'
import ErrorBoundary from '../error-boundary'
import { TabName } from './tabs'

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
      /* webpackChunkName: "asset-overview-queued-asset-info" */ '@/components/queued-asset-info'
    )
)

const useStyles = makeStyles({
  // columns
  cols: {
    maxWidth: '100vw',
    display: 'flex',
    flexDirection: 'row',

    [mediaQueryForMobiles]: {
      flexDirection: 'column',
    },
  },
  leftCol: {
    width: '100%',
    minWidth: 0, // fix flex shrink issue
  },
  rightCol: {
    maxWidth: '200px',
    flexShrink: 0,
    marginLeft: '1rem',
    [mediaQueryForWideDesktops]: {
      maxWidth: '300px',
    },
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
    [mediaQueryForMobiles]: {
      marginTop: '0.25rem',
      display: 'block',
    },
  },
  primaryImageGallery: {
    marginBottom: '1rem',
  },
  primaryMetadata: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  primaryMetadataThumb: {
    marginRight: '1rem',
    [mediaQueryForMobiles]: {
      marginRight: 0,
    },
  },
  thumbnail: {
    [mediaQueryForMobiles]: { width: '100%', height: 'auto' },
  },
  primaryMetadataText: {
    fontSize: '300%',
    display: 'flex',
    alignItems: 'center',
    [mediaQueryForMobiles]: { width: '100%', marginTop: '0.5rem' },
  },
  category: {
    '&&': {
      margin: 0,
      fontSize: '2rem', // match h1
      marginRight: '0.5rem',
    },
    '& a': {
      color: 'inherit',
    },
  },
  categoryForAvatar: {
    '&&': {
      margin: 0,
      fontSize: '100%', // match species
    },
    '& a': {
      // color: 'inherit',
    },
  },
  thumbnailWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  categoryAndSpecies: {
    fontSize: '150%',
    fontWeight: '300',
  },
  titleAndAuthor: {
    // fontSize: '300%',
  },
  subTitle: {
    fontSize: '1rem',
    fontWeight: '300',
    [mediaQueryForMobiles]: {
      marginTop: '0.25rem',
    },
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
  count: {
    marginLeft: '0.5rem',
    fontSize: '75%',
    color: colorGreyedOut,
  },
})

const ControlGroup = styled.div<{ greyed?: boolean }>`
  margin-bottom: 0.5rem;
  color: ${({ greyed }) => (greyed ? colorGreyedOut : 'inherit')};
  &:last-child {
    margin-bottom: 0;
  }
`

const Control = styled.div<{ small?: boolean }>`
  margin-bottom: 0.25rem;
  font-size: ${({ small }) => (small ? '75%' : 'inherit')};
  &:last-child {
    margin-bottom: 0;
  }
`

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

const useSluggedAsset = (
  idOrSlug: string
): [
  boolean,
  DataStoreErrorCode | null,
  FullAsset | null | false,
  HydrateFn
] => {
  const isEditor = useIsEditor()
  const isSlug = getIsUuid(idOrSlug) === false && idOrSlug.includes('-')

  const [isLoading, lastErrorCode, results, hydrate] =
    useDatabaseQuery<FullAsset>(
      isEditor ? ViewNames.GetFullAssets_Editor : ViewNames.GetFullAssets,
      [[isSlug ? 'slug' : 'id', Operators.EQUALS, idOrSlug]],
      { queryName: `asset-overview-${idOrSlug}` }
    )

  const result = Array.isArray(results)
    ? results.length === 1
      ? results[0]
      : false
    : null

  return [isLoading, lastErrorCode, result, hydrate]
}

const AssetOverview = ({
  assetId: assetIdOrSlug,
  tabName,
}: {
  assetId: string
  tabName?: string
}) => {
  const isLoggedIn = useIsLoggedIn()
  const isEditor = useIsEditor()
  const [isLoadingAsset, lastErrorCode, asset, hydrate] =
    useSluggedAsset(assetIdOrSlug)

  const isLoading = isLoadingAsset || asset === null
  const hasLoadedAndExists =
    isLoading === false && asset !== null && asset !== false

  const assetId = asset ? asset.id : assetIdOrSlug

  const classes = useStyles()
  const [, , user] = useUserRecord()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [bypassAdultFilterOnce, setBypassAdultFilterOnce] = useState(false)
  const [, setIsAlreadyOver18] = useStorage(alreadyOver18Key)

  const hideBecauseAdult =
    asset && asset.isadult && !isAdultContentEnabled && !bypassAdultFilterOnce

  const urlToAsset = routes.viewAssetWithVar.replace(
    ':assetId',
    asset && asset.slug ? asset.slug : assetId
  )

  useEffect(() => {
    console.debug('asset loaded, scrolling to top...')
    scrollToTop()
  }, [asset ? asset.id : undefined])

  if (
    lastErrorCode !== null ||
    (asset &&
      ((asset.category as string) === 'world' ||
        (asset.category as string) === 'article')) ||
    (!isLoading && asset === false)
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

  const nonMediaAttachments =
    asset && asset.attachmentsdata
      ? asset.attachmentsdata.filter(
          (attachment) => attachment.type !== AttachmentType.File
        )
      : []
  const firstFileAttachment =
    asset && asset.attachmentsdata
      ? asset.attachmentsdata.find(
          (attachment) => attachment.type === AttachmentType.File
        )
      : undefined
  const hasPrimaryImage = nonMediaAttachments.length > 0

  const VisitSourceButtons = asset ? (
    <>
      {asset?.relations?.find((relation) => relation.requiresVerification) ? (
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
      {[
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
        ))}
    </>
  ) : (
    <Control>
      <VisitSourceButton isAssetLoading />
    </Control>
  )

  const isAssetLoaded =
    asset !== null &&
    asset !== undefined &&
    asset !== false &&
    isLoading !== true

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
        {!isAssetLoaded || !hasLoadedAndExists ? (
          <Helmet>
            <title>Loading asset...</title>
          </Helmet>
        ) : (
          <Helmet>
            <title>
              {asset.title || '(no title)'}{' '}
              {asset.authorname ? ` | By ${asset.authorname}` : ''}
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
        {isAssetLoaded && getIsAssetWaitingForApproval(asset) && isEditor ? (
          <Suspense
            fallback={<LoadingIndicator message="Loading component..." />}>
            <QueuedAssetInfo asset={asset} hydrate={hydrate} />
          </Suspense>
        ) : null}
        <Messages />
        <div className={classes.primaryMetadata}>
          <div>
            <div className={classes.categoryAndSpecies}>
              {/* {isAssetLoaded ? (
                <Link
                  to={routes.viewCategoryWithVar.replace(
                    ':categoryName',
                    asset.category
                  )}>
                  {asset.category
                    ? getCategoryMeta(asset.category).nameSingular
                    : '(no category)'}
                </Link>
              ) : (
                <LoadingShimmer width={300} height={50} />
              )}{' '} */}
              {asset ? (
                asset.category === AssetCategory.Avatar ? (
                  <>
                    <Typography
                      variant="h1"
                      component="span"
                      className={classes.categoryForAvatar}>
                      <Link
                        to={routes.viewCategoryWithVar.replace(
                          ':categoryName',
                          asset.category
                        )}>
                        {asset.category
                          ? getCategoryMeta(asset.category).nameSingular
                          : '(no category)'}
                      </Link>
                    </Typography>
                    {' / '}
                    <SpeciesList
                      speciesIds={asset.species ? asset.species : []}
                      speciesNames={
                        asset.speciesnames ? asset.speciesnames : []
                      }
                    />
                  </>
                ) : null
              ) : (
                <LoadingShimmer width={300} height={50} />
              )}
            </div>
            <div className={classes.primaryMetadataText}>
              {isAssetLoaded ? (
                asset.category !== AssetCategory.Avatar ? (
                  <Typography
                    variant="h1"
                    component="span"
                    className={classes.category}>
                    <Link
                      to={routes.viewCategoryWithVar.replace(
                        ':categoryName',
                        asset.category
                      )}>
                      {asset.category
                        ? getCategoryMeta(asset.category).nameSingular
                        : '(no category)'}
                      {': '}
                    </Link>
                  </Typography>
                ) : null
              ) : (
                <LoadingShimmer width={300} height={50} />
              )}{' '}
              <Heading variant="h1" noMargin className={classes.titleAndAuthor}>
                {!isAssetLoaded ? (
                  <LoadingShimmer width={300} height={50} />
                ) : (
                  <>
                    <Link to={urlToAsset}>{asset.title}</Link>
                    <NsfwIcon />
                  </>
                )}
                <span className={classes.authorName}>
                  {' '}
                  {!isAssetLoaded ? (
                    <LoadingShimmer width={200} height={30} />
                  ) : (
                    <>
                      by{' '}
                      <Link
                        to={routes.viewAuthorWithVar.replace(
                          ':authorId',
                          asset.author || 'no-author'
                        )}>
                        {asset.authorname || '(no author name)'}
                      </Link>
                    </>
                  )}
                </span>
              </Heading>
              {!isAssetLoaded ? (
                <LoadingShimmer width={200} height={25} />
              ) : (
                <div className={classes.subTitle}></div>
              )}
            </div>
          </div>
        </div>
        {tabName === TabName.Relations ? (
          asset ? (
            <ErrorBoundary>
              <FullAssetTree activeAsset={asset} />
            </ErrorBoundary>
          ) : (
            <LoadingIndicator message="Loading asset..." />
          )
        ) : (
          <div className={classes.cols}>
            <div className={classes.leftCol}>
              {asset &&
                (asset.relations?.length || asset.mentionsdata?.length) && (
                  <ErrorBoundary>
                    <AssetTree activeAsset={asset} />
                  </ErrorBoundary>
                )}
              <PrimaryImage />
              {isMobile && VisitSourceButtons}
              <Area name="desc" label="Description">
                <TabDescription />
              </Area>
              {nonMediaAttachments.length > 3 && (
                <Area name="extra-attached-images" label="Images">
                  <ImageGallery
                    images={
                      !isAssetLoaded
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
                  {asset && asset.relations && asset.relations.length ? (
                    <Area name="relations">
                      <Relations relations={asset.relations} />
                    </Area>
                  ) : null}
                  {asset &&
                  (asset.aisimilarities !== null ||
                    (asset.similarassets !== null &&
                      asset.similarassets.length)) ? (
                    <Area name="similar" label="Similar Assets">
                      <TabSimilar />
                    </Area>
                  ) : null}
                  <Area name="mentions" label="Mentions">
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
              {isAssetLoaded ? (
                <ControlGroup>
                  {!isMobile && VisitSourceButtons}
                  <Control>
                    <RiskyFileNotice sourceUrl={asset ? asset.sourceurl : ''} />
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
              ) : (
                <ControlGroup>
                  <Control>
                    <VisitSourceButton isAssetLoading={true} />
                  </Control>
                </ControlGroup>
              )}

              {asset && asset.publishedby && asset.publishedbyusername ? (
                <ControlGroup greyed>
                  <Control small>
                    Submitted by{' '}
                    <UsernameLink
                      id={asset.publishedby}
                      username={asset.publishedbyusername}
                    />{' '}
                    {asset.approvedby ? (
                      <>
                        approved by{' '}
                        <UsernameLink
                          id={asset.approvedby}
                          username={asset.approvedbyusername}
                        />
                      </>
                    ) : null}
                    <Tooltip
                      title={
                        <>
                          Every asset on this website was (hopefully) submitted
                          by a human.
                          <br />
                          <br />
                          Published{' '}
                          {asset.publishedat
                            ? getFriendlyDate(asset.publishedat)
                            : '(no date)'}{' '}
                          by {asset.publishedbyusername || '(no name)'}
                          {(asset.approvalstatus === ApprovalStatus.Approved ||
                            asset.approvalstatus ===
                              ApprovalStatus.AutoApproved) && (
                            <>
                              <br />
                              Approved{' '}
                              {asset.approvedat
                                ? getFriendlyDate(asset.approvedat)
                                : ''}{' '}
                              by{' '}
                              {asset.approvedbyusername ||
                                'our automated system'}
                            </>
                          )}
                        </>
                      }>
                      <InfoIcon />
                    </Tooltip>
                  </Control>
                </ControlGroup>
              ) : null}
              <ControlGroup>
                {asset && (
                  <ControlGroup>
                    {asset.tags
                      .sort((a, b) => a.localeCompare(b))
                      .map((tag, i) => {
                        const stats = asset.tagscount?.find(
                          (stats) => stats.tag === tag
                        )
                        return (
                          <div key={tag}>
                            <TagChip
                              tagName={tag}
                              label={
                                <>
                                  {tag}
                                  {stats ? (
                                    <span className={classes.count}>
                                      {stats.count}
                                    </span>
                                  ) : null}
                                </>
                              }
                              isFilled
                            />
                          </div>
                        )
                      })}
                  </ControlGroup>
                )}
                <Control>
                  <EndorseAssetButton
                    isAssetLoading={!isAssetLoaded}
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
                    isAssetLoading={!isAssetLoaded}
                    assetId={assetId}
                    onClick={() =>
                      trackAction(
                        analyticsCategoryName,
                        'Click add to collection button',
                        assetId
                      )
                    }
                  />
                </Control>
                <Control>
                  <AddToWishlistButton
                    isAssetLoading={!isAssetLoaded}
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
              </ControlGroup>
              {isLoggedIn && (
                <ControlGroup>
                  <Suspense
                    fallback={
                      <LoadingIndicator message="Loading controls..." />
                    }>
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
                    fallback={
                      <LoadingIndicator message="Loading controls..." />
                    }>
                    <CreatorControls />
                  </Suspense>
                </ControlGroup>
              ) : null}
              {isEditor && (
                <ControlGroup>
                  <Suspense
                    fallback={
                      <LoadingIndicator message="Loading controls..." />
                    }>
                    <EditorControls />
                  </Suspense>
                </ControlGroup>
              )}
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
                      Last modified{' '}
                      <FormattedDate date={asset.lastmodifiedat} /> by{' '}
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
                </ControlGroup>
              )}
            </div>
          </div>
        )}
      </AssetOverviewContext.Provider>
    </>
  )
}

export default AssetOverview
