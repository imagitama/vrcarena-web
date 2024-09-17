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
import AssetResults from '../../components/asset-results'
import Heading from '../../components/heading'
import Button from '../../components/button'
import DiscordServerWidget from '../../components/discord-server-widget'
import SocialMediaList from '../../components/social-media-list'
import OpenForCommissionMessage from '../../components/open-for-commissions-message'
import Avatar from '../../components/avatar'
import EditorRecordManager from '../../components/editor-record-manager'
import Message from '../../components/message'

import useUserRecord from '../../hooks/useUserRecord'
import {
  CollectionNames as OldCollectionNames,
  AssetFieldNames,
  AccessStatuses,
  OrderDirections,
} from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'

import { CollectionNames } from '../../data-store'
import { canEditAuthor } from '../../utils'
import { trackAction } from '../../analytics'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { FullAuthor } from '../../modules/authors'
import SaleInfo from '../../components/sale-info'
import PaginatedView from '../../components/paginated-view'
import { PublicAsset } from '../../modules/assets'

const Renderer = ({ items }: { items?: PublicAsset[] }) => (
  <AssetResults assets={items} />
)

function AssetsByAuthor({ author }: { author: FullAuthor }) {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    (query) => {
      query = query.eq(AssetFieldNames.author, author.id)
      if (!isAdultContentEnabled) {
        query = query.eq(AssetFieldNames.isAdult, false)
      }
      return query
    },
    [author.id, isAdultContentEnabled]
  )

  return (
    <PaginatedView
      viewName={'getPublicAssets'}
      getQuery={getQuery}
      getQueryString={() => `author:"${author.name}"`}
      defaultFieldName={AssetFieldNames.createdAt}
      defaultDirection={OrderDirections.DESC}>
      <Renderer />
    </PaginatedView>
  )
}

const useStyles = makeStyles({
  categories: {
    marginTop: '0',
    marginBottom: '1rem',
    fontSize: '150%',
  },
  findMoreAuthorsBtn: {
    marginTop: '3rem',
    textAlign: 'center',
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

function FindMoreAuthorsBtn() {
  const classes = useStyles()

  return (
    <div className={classes.findMoreAuthorsBtn}>
      <Button
        url={routes.authors}
        onClick={() =>
          trackAction('ViewAuthor', 'Click find more authors button')
        }>
        Find More Authors
      </Button>
    </div>
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

  const isDeleted = accessStatus === AccessStatuses.Deleted

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
              discordUsername: discordUsername,
              twitterUsername: twitterUsername,
              patreonUsername: patreonUsername,
              discordServerInviteUrl: discordServerInviteUrl,
              boothUsername: boothUsername,
            }}
            actionCategory={analyticsCategory}
          />

          {saleReason !== null ? (
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

      {user ? (
        <Button
          url={routes.createAmendmentWithVar
            .replace(':parentTable', OldCollectionNames.Authors)
            .replace(':parentId', authorId)}
          color="default"
          icon={<EditIcon />}>
          Suggest Edit
        </Button>
      ) : null}

      <FindMoreAuthorsBtn />
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
