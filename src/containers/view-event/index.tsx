import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import LaunchIcon from '@material-ui/icons/Launch'
import { makeStyles } from '@material-ui/core/styles'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import EditIcon from '@material-ui/icons/Edit'

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

const useStyles = makeStyles({
  root: { position: 'relative' },
  primary: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    '& > *': {
      alignSelf: 'center',
    },
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  callToAction: {
    marginTop: '2rem',
  },
  description: {
    marginTop: '2rem',
  },
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
  meta: {
    marginTop: '5rem',
    fontSize: '75%',
    opacity: '0.8',
    '& dd': {
      margin: 0,
    },
  },
  authors: {},
  authorItem: {
    display: 'flex',
    marginBottom: '0.5rem',
    '& > :last-child': {
      width: '100%',
      padding: '0.5rem',
    },
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
    return null
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets</ErrorMessage>
  }

  if (!Array.isArray(results) || !results.length) {
    return null
  }

  return (
    <>
      <Heading variant="h2">Assets Tagged For This Event</Heading>
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

const AuthorsWithSales = ({ eventSlug }: { eventSlug: string }) => {
  const getQuery = useCallback(() => {
    const fixedReason = eventSlug.replaceAll('-', '_')

    let query = supabase
      .from('getPublicAuthors'.toLowerCase())
      .select('*')
      .eq(AuthorFieldNames.saleReason, fixedReason)

    return query
  }, [eventSlug])
  const [isLoading, isErrored, authors] = useDataStore<FullAuthor>(
    getQuery,
    'authors-for-event'
  )

  if (isLoading) {
    return null
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get authors</ErrorMessage>
  }

  if (!Array.isArray(authors) || !authors.length) {
    return null
  }

  return (
    <>
      <Heading variant="h2">Event Sales</Heading>
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
  } = events[0]

  return (
    <>
      <Helmet>
        <title>{`${name || '(unnamed)'} | VRCArena`}</title>
        {description ? <meta name="description" content={description} /> : null}
      </Helmet>
      <div className={classes.root}>
        <div className={classes.controls}>
          <Button url={routes.events} icon={<ChevronLeftIcon />} switchIconSide>
            Back To Events
          </Button>{' '}
          {isEditor ? (
            <Button
              url={routes.editEventWithVar.replace(':eventId', id)}
              icon={<EditIcon />}>
              Edit Event
            </Button>
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
        {editornotes ? <PublicEditorNotes notes={editornotes} /> : null}
        <div className={classes.primary}>
          {thumbnailurl ? (
            <img src={thumbnailurl} alt="Thumbnail for event" width={300} />
          ) : null}
          <Heading variant="h1">
            <Link
              to={routes.viewEventWithVar.replace(':eventId', eventIdOrSlug)}>
              {name || '(unnamed)'}
            </Link>
          </Heading>
          {/* <div className={classes.dates}>
            {startsAt ? <DateWithTimezone date={startsAt} /> : null}
            {startsAt && endsAt ? (
              <div className={classes.separator}>
                <ArrowForwardIcon />
              </div>
            ) : null}
            {endsAt ? <DateWithTimezone date={endsAt} /> : null}
          </div> */}
          {sourceurl ? (
            <div className={classes.callToAction}>
              <Button size="large" icon={<LaunchIcon />} url={sourceurl}>
                Visit Website
              </Button>
            </div>
          ) : (
            <>No source URL set</>
          )}
          {description ? (
            <div className={classes.description}>
              <Markdown source={description} />
            </div>
          ) : (
            <>No description set</>
          )}
        </div>
        <Heading variant="h2">Comments</Heading>
        <CommentList collectionName={CollectionNames.Events} parentId={id} />
        <AuthorsWithSales eventSlug={slug} />
        <Assets tagsToSearch={assettags || []} />
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
