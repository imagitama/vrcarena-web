import React, { Fragment, useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import EditIcon from '@material-ui/icons/Edit'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'

import Markdown from '../../components/markdown'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'
import Button from '../../components/button'
import DiscordServerWidget from '../../components/discord-server-widget'
import SocialMediaList from '../../components/social-media-list'
import OpenForCommissionMessage from '../../components/open-for-commissions-message'
import Avatar from '../../components/avatar'
import EditorRecordManager from '../../components/editor-record-manager'
import Message from '../../components/message'

import useUserRecord from '../../hooks/useUserRecord'

import { CollectionNames } from '../../modules/authors'
import { ViewNames as ClaimViewNames, FullClaim } from '../../modules/claims'
import { canEditAuthor } from '../../utils'
import { trackAction } from '../../analytics'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { FullAuthor } from '../../modules/authors'
import SaleInfo from '../../components/sale-info'
import { PublicAsset, ViewNames } from '../../modules/assets'
import { AccessStatus } from '../../modules/common'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '../../hooks/useDatabaseQuery'
import AssetsPaginatedView from '../../components/assets-paginated-view'
import ClaimButton from '../../components/claim-button'
import UserList from '../../components/user-list'
import LazyLoad from 'react-lazyload'
import { GetQuery } from '../../data-store'
import { FullUser } from '../../modules/users'

function AssetsByAuthor({ author }: { author: FullAuthor }) {
  const getQuery = useCallback<
    (query: GetQuery<PublicAsset>) => GetQuery<PublicAsset>
  >((query) => query.eq('author', author.id), [author.id])

  return (
    <AssetsPaginatedView
      viewName={ViewNames.GetPublicAssets}
      getQuery={getQuery}
      getQueryString={() => `author:"${author.name}"`}
      defaultFieldName={'createdat'}
      defaultDirection={OrderDirections.DESC}
    />
  )
}

const useStyles = makeStyles({
  categories: {
    marginTop: '0',
    marginBottom: '1rem',
    fontSize: '150%',
  },
  icon: {
    '& svg': {
      verticalAlign: 'middle',
      width: 'auto',
      height: '1em',
    },
  },
  cols: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  col: {
    width: 'calc(50% - 0.5rem)',
    margin: '0 0.5rem 0 0',
    '&:last-child': {
      margin: '0 0 0 0.5rem',
    },
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
    },
  },
  title: {
    textAlign: 'center',
  },
  avatar: {
    display: 'inline-block',
  },
  desc: {
    textAlign: 'center',
  },
})

const Claims = ({ authorId }: { authorId: string }) => {
  const [, lastErrorCode, results] = useDatabaseQuery<FullClaim>(
    ClaimViewNames.GetFullClaims,
    [['parent', Operators.EQUALS, authorId]]
  )

  if (!results || !results.length) {
    return null
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to load claims</ErrorMessage>
  }

  return (
    <>
      <Heading variant="h2">Claims</Heading>
      <UserList
        users={results.map(
          (claim) =>
            ({
              id: claim.createdby,
              username: claim.createdbyusername,
              avatarurl: claim.createdbyavatarurl,
            } as FullUser)
        )}
      />
    </>
  )
}

const analyticsCategory = 'ViewAuthor'

const View = () => {
  const { authorId } = useParams<{ authorId: string }>()
  const [, , user] = useUserRecord()
  const [isLoading, isErrored, author, hydrate] = useDataStoreItem<FullAuthor>(
    'getfullauthors',
    authorId,
    'view-author'
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get author</ErrorMessage>
  }

  if (!author) {
    return <ErrorMessage>The author does not exist</ErrorMessage>
  }

  const {
    name: name,
    description: description,
    categories: categories,
    discordserverid: discordServerId,
    isopenforcommission: isOpenForCommission,
    commissioninfo: commissionInfo,
    avatarurl: avatarUrl,
    email: email,
    websiteurl: websiteUrl,
    gumroadusername: gumroadUsername,
    discordusername: discordUsername,
    twitterusername: twitterUsername,
    patreonusername: patreonUsername,
    itchusername: itchUsername,
    jinxxyusername: jinxxyUsername,
    discordserverinviteurl: discordServerInviteUrl,
    lastmodifiedby: lastModifiedBy,
    boothusername: boothUsername,
    salereason: saleReason,
    saledescription: saleDescription,
    saleexpiresat: saleExpiresAtString,

    // view
    createdbyusername: createdByUsername,
    lastmodifiedbyusername: lastModifiedByUsername,

    // meta
    publishstatus: publishStatus,
    accessstatus: accessStatus,
    approvalstatus: approvalStatus,
    editornotes: editorNotes,
    createdby: createdBy,
  } = author

  const isDeleted = accessStatus === AccessStatus.Deleted

  const saleExpiresAt = saleExpiresAtString
    ? new Date(saleExpiresAtString)
    : null

  return (
    <>
      <Helmet>
        <title>View assets created by author {name} | VRCArena</title>
        <meta
          name="description"
          content={`Browse all of the assets that have been uploaded for the author ${name}.`}
        />
      </Helmet>

      {isDeleted !== false && <Message>This author has been deleted</Message>}
      {editorNotes && (
        <Message>
          <strong>Notes from our staff</strong>
          <br />
          <br />
          {editorNotes}
        </Message>
      )}

      <div className={classes.cols}>
        <div className={classes.col}>
          <div className={classes.title}>
            <div className={classes.avatar}>
              <Avatar url={avatarUrl} username={name} noHat lazy={false} />
            </div>
            <Heading variant="h1">
              <Link
                to={routes.viewAuthorWithVar.replace(':authorId', authorId)}>
                {name}
              </Link>
            </Heading>
            <div className={classes.categories}>
              {categories && categories.length
                ? categories
                    .filter((categoryName) => categoryName in categoryMeta)
                    .map((categoryName, idx) => (
                      <Fragment key={categoryName}>
                        {idx !== 0 && ', '}
                        <Link
                          key={categoryName}
                          to={routes.viewCategoryWithVar.replace(
                            ':categoryName',
                            categoryName
                          )}>
                          {categoryMeta[categoryName].name}
                        </Link>
                      </Fragment>
                    ))
                : null}
            </div>
          </div>

          {description && <Markdown source={description} />}

          <SocialMediaList
            socialMedia={{
              email,
              websiteUrl,
              gumroadUsername,
              discordUsername,
              twitterUsername,
              patreonUsername,
              discordServerInviteUrl,
              boothUsername,
              itchUsername,
              jinxxyUsername,
            }}
            actionCategory={analyticsCategory}
          />

          {saleReason ? (
            <SaleInfo
              authorId={authorId}
              eventId={saleReason}
              description={saleDescription}
              expiresAt={saleExpiresAt}
              showViewAuthorButton={false}
              showViewEventButton={true}
            />
          ) : null}

          {isOpenForCommission && (
            <OpenForCommissionMessage
              authorId={authorId}
              info={commissionInfo}
            />
          )}

          {!isOpenForCommission && commissionInfo && (
            <>
              <Heading variant="h2">Commission Info</Heading>
              {commissionInfo}
            </>
          )}
        </div>
        <div className={classes.col}>
          <AssetsByAuthor author={author} />
        </div>
      </div>

      {discordServerId && (
        <DiscordServerWidget
          serverId={discordServerId}
          joinActionCategory={analyticsCategory}
        />
      )}

      {user && canEditAuthor(user) && (
        <>
          <Heading variant="h2">Actions</Heading>
          <EditorRecordManager
            id={authorId}
            metaCollectionName={CollectionNames.AuthorsMeta}
            editUrl={routes.editAuthorWithVar.replace(':authorId', authorId)}
            existingApprovalStatus={approvalStatus}
            existingPublishStatus={publishStatus}
            existingAccessStatus={accessStatus}
            existingEditorNotes={editorNotes}
            onDone={() => hydrate()}
          />
        </>
      )}

      <Heading variant="h2">Meta</Heading>
      <div>
        Created by{' '}
        <Link to={routes.viewUserWithVar.replace(':userId', createdBy)}>
          {createdByUsername}
        </Link>
      </div>

      {lastModifiedBy && (
        <div>
          Last modified by{' '}
          <Link to={routes.viewUserWithVar.replace(':userId', lastModifiedBy)}>
            {lastModifiedByUsername}
          </Link>
        </div>
      )}

      <br />

      <Button
        url={routes.authors}
        onClick={() =>
          trackAction('ViewAuthor', 'Click find more authors button')
        }>
        Find More Authors...
      </Button>

      {user ? (
        <>
          {' '}
          <Button
            url={routes.createAmendmentWithVar
              .replace(':parentTable', CollectionNames.Authors)
              .replace(':parentId', authorId)}
            color="default"
            icon={<EditIcon />}>
            Suggest Edit
          </Button>{' '}
          <ClaimButton
            parentTable={CollectionNames.Authors}
            parentId={author.id}
            parentData={author}
          />
        </>
      ) : null}

      <LazyLoad placeholder={<LoadingIndicator message="Scroll down..." />}>
        <Claims authorId={authorId} />
      </LazyLoad>
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View author | VRCArena</title>
      <meta name="description" content="View an author on the site." />
    </Helmet>
    <View />
  </>
)
