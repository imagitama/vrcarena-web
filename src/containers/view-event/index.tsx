import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import LaunchIcon from '@material-ui/icons/Launch'
import { makeStyles } from '@material-ui/core/styles'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import EditIcon from '@material-ui/icons/Edit'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'

import * as routes from '../../routes'
import { client, client as supabase } from '../../supabase'

import useDataStore from '../../hooks/useDataStore'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { AssetFieldNames, AuthorFieldNames } from '../../hooks/useDatabaseQuery'

import Link from '../../components/link'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import Markdown from '../../components/markdown'
import Button from '../../components/button'
import TagChips from '../../components/tag-chips'
import AssetResults from '../../components/asset-results'
import { useParams } from 'react-router'
import { FullAuthor } from '../../modules/authors'
import AuthorResultsItem from '../../components/author-results-item'
import SaleInfo from '../../components/sale-info'
import { CollectionNames, FullEvent, ViewNames } from '../../modules/events'
import LoadingIndicator from '../../components/loading-indicator'
import NoResultsMessage from '../../components/no-results-message'
import useIsEditor from '../../hooks/useIsEditor'
import EditorRecordManager from '../../components/editor-record-manager'
import PublicEditorNotes from '../../components/public-editor-notes'
import CommentList from '../../components/comment-list'
import Paper from '../../components/paper'
import Block from '../../components/block'
import FormattedDate from '../../components/formatted-date'
import { mediaQueryForMobiles } from '../../media-queries'

const useStyles = makeStyles({
  root: { position: 'relative' },
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
  // callToAction: {
  //   marginTop: '2rem',
  // },
  // description: {
  //   margin: '2rem 0',
  //   '& p:first-child': {
  //     marginTop: 0,
  //   },
  //   '& p:last-child': {
  //     marginBottom: 0,
  //   },
  // },
  dates: {
    marginTop: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateWrapper: {
    textAlign: 'center',
  },
  date: {
    display: 'block',
    fontSize: '150%',
  },
  separator: {
    fontSize: '150%',
    margin: '0 2rem',
  },
  timezone: {
    display: 'block',
    marginTop: '0.5rem',
    fontSize: '100%',
  },
  // meta: {
  //   marginTop: '5rem',
  //   fontSize: '75%',
  //   opacity: '0.8',
  //   '& dd': {
  //     margin: 0,
  //   },
  // },
  authors: {},
  authorItem: {
    display: 'flex',
    marginBottom: '0.5rem',
    '& > :last-child': {
      width: '100%',
      padding: '0.5rem',
    },
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
})

const Assets = ({ tagsToSearch }: { tagsToSearch: string[] }) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(() => {
    if (!tagsToSearch.length) {
      return false
    }

    let query = supabase
      .from('getPublicAssets'.toLowerCase())
      .select('*')
      .contains(AssetFieldNames.tags, tagsToSearch)

    if (!isAdultContentEnabled) {
      query = query.eq(AssetFieldNames.isAdult, false)
    }

    return query
  }, [isAdultContentEnabled, tagsToSearch.join('+')])
  const [isLoading, isErrored, results] = useDataStore(
    getQuery,
    'assets-for-event'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading assets with tags..." />
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to get assets with tags {tagsToSearch.join(', ')}
      </ErrorMessage>
    )
  }

  if (!Array.isArray(results) || !results.length) {
    return (
      <NoResultsMessage>
        No assets with tags {tagsToSearch.join(', ')}
        <br />
        <br />
        Hint: Add one of the tags to have your asset show up here
      </NoResultsMessage>
    )
  }

  return (
    <>
      <TagChips tags={tagsToSearch} />
      <AssetResults assets={results} />
    </>
  )
}

const AuthorResults = ({ authors }: { authors: FullAuthor[] }) => {
  const classes = useStyles()

  return (
    <div className={classes.authors}>
      {authors.map((author) => (
        <div key={author.id} className={classes.authorItem}>
          <div>
            <AuthorResultsItem author={author} />
          </div>
          <div>
            <SaleInfo
              authorId={author.id}
              eventId={author.salereason}
              description={author.saledescription}
              expiresAt={
                author.saleexpiresat ? new Date(author.saleexpiresat) : null
              }
              showTitle={false}
              showViewAuthorButton={false}
              showViewEventButton={false}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const AuthorsWithSales = ({ eventId }: { eventId: string }) => {
  const getQuery = useCallback(() => {
    let query = supabase
      .from('getPublicAuthors'.toLowerCase())
      .select('*')
      .eq(AuthorFieldNames.saleReason, eventId)

    return query
  }, [eventId])
  const [isLoading, isErrored, authors] = useDataStore<FullAuthor>(
    getQuery,
    'authors-for-event'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading authors with sales..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get authors with sales</ErrorMessage>
  }

  if (!Array.isArray(authors) || !authors.length) {
    return (
      <NoResultsMessage>
        No authors with a sale found
        <br />
        <br />
        Hint: Add a sale to your author page to have it show here
      </NoResultsMessage>
    )
  }

  return (
    <>
      <AuthorResults authors={authors} />
    </>
  )
}

const View = () => {
  const { eventId: eventIdOrSlug } = useParams<{ eventId: string }>()
  const getQuery = useCallback(
    () =>
      client
        .from(ViewNames.GetFullEvents)
        .select('*')
        .or(`id.eq.${eventIdOrSlug},slug.eq.${eventIdOrSlug}`),
    [eventIdOrSlug]
  )
  const [isLoading, isError, events, , hydrate] = useDataStore<FullEvent[]>(
    getQuery,
    'view-event'
  )
  const classes = useStyles()
  const isEditor = useIsEditor()

  if (isLoading) {
    return <LoadingIndicator message="Loading event..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load event</ErrorMessage>
  }

  if (!events || !events.length) {
    return <NoResultsMessage />
  }

  const {
    id,
    name,
    description,
    thumbnailurl,
    sourceurl,
    assettags,
    slug,
    approvalstatus,
    accessstatus,
    editornotes,
    featuredstatus,
    startsat,
    endsat,
  } = events[0]

  return (
    <>
      <Helmet>
        <title>{`${name || '(unnamed)'} | VRCArena`}</title>
        {description ? <meta name="description" content={description} /> : null}
      </Helmet>
      <div className={classes.root}>
        {editornotes ? <PublicEditorNotes notes={editornotes} /> : null}
        <div className={classes.primaryMetadata}>
          {thumbnailurl ? (
            <img src={thumbnailurl} alt="Thumbnail for event" width={300} />
          ) : null}
          <Heading variant="h1">
            <Link
              to={routes.viewEventWithVar.replace(':eventId', eventIdOrSlug)}>
              {name || '(unnamed)'}
            </Link>
          </Heading>
        </div>
        <div className={classes.dates}>
          {startsat ? (
            <FormattedDate date={startsat} isRelative={false} />
          ) : null}
          {startsat && endsat ? (
            <div className={classes.separator}>
              <ArrowForwardIcon />
            </div>
          ) : null}
          {endsat ? <FormattedDate date={endsat} isRelative={false} /> : null}
        </div>
        <div className={classes.cols}>
          <div className={classes.leftCol}>
            <Block>
              {description ? (
                <Markdown source={description} />
              ) : (
                <NoResultsMessage>No description set</NoResultsMessage>
              )}
            </Block>
            <Block title="Sales">
              <AuthorsWithSales eventId={id} />
            </Block>
            <Block title="Comments">
              <CommentList
                collectionName={CollectionNames.Events}
                parentId={id}
              />
            </Block>
            <Block title="Tagged Events">
              <Assets tagsToSearch={assettags || []} />
            </Block>
          </div>
          <div className={classes.rightCol}>
            {sourceurl && (
              <div className={classes.controlGroup}>
                <Button size="large" icon={<LaunchIcon />} url={sourceurl}>
                  Visit Website
                </Button>
              </div>
            )}
            <div className={classes.controlGroup}>
              <Button
                url={routes.events}
                icon={<ChevronLeftIcon />}
                color="default"
                switchIconSide>
                Back To Events
              </Button>
            </div>
            {isEditor ? (
              <div className={classes.controlGroup}>
                <Button
                  url={routes.editEventWithVar.replace(':eventId', id)}
                  icon={<EditIcon />}
                  color="default">
                  Edit Event
                </Button>
              </div>
            ) : null}

            {isEditor && (
              <EditorRecordManager
                id={id}
                collectionName={CollectionNames.Events}
                metaCollectionName={CollectionNames.EventsMeta}
                existingApprovalStatus={approvalstatus}
                existingAccessStatus={accessstatus}
                existingEditorNotes={editornotes}
                existingFeaturedStatus={featuredstatus}
                onDone={hydrate}
                showApprovalButtons={false}
                showFeatureButtons={true}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View an event | VRCArena</title>
      <meta
        name="description"
        content="View more details about an event posted on the site."
      />
    </Helmet>
    <View />
  </>
)
