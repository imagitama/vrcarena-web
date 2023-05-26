import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'
import EditIcon from '@material-ui/icons/Edit'
import LaunchIcon from '@material-ui/icons/Launch'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { makeStyles } from '@material-ui/core/styles'
import moment from 'moment'

import { getCanUserEditThisEvent } from '../../permissions'
import * as routes from '../../routes'
import { CollectionNames, EventsFieldNames } from '../../data-store'
import { client as supabase } from '../../supabase'

import useDataStoreItem from '../../hooks/useDataStoreItem'
import useBanner from '../../hooks/useBanner'
import useDataStore from '../../hooks/useDataStore'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import Link from '../../components/link'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import Markdown from '../../components/markdown'
import Button from '../../components/button'
import FormattedDate from '../../components/formatted-date'
import UsernameLink from '../../components/username-link'
import PaginatedViewControls from '../../components/paginated-view-controls'
import NoResultsMessage from '../../components/no-results-message'
import AssetResults from '../../components/asset-results'

const useStyles = makeStyles({
  root: { position: 'relative' },
  primary: {
    display: 'flex',
    flexDirection: 'column',
    '& > *': {
      alignSelf: 'center'
    }
  },
  controls: {
    marginTop: '2rem'
  },
  description: {
    marginTop: '2rem'
  },
  dates: {
    marginTop: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dateWrapper: {
    textAlign: 'center'
  },
  date: {
    display: 'block',
    fontSize: '150%'
  },
  separator: {
    fontSize: '150%',
    margin: '0 2rem'
  },
  timezone: {
    display: 'block',
    marginTop: '0.5rem',
    fontSize: '100%'
  },
  meta: {
    marginTop: '5rem',
    fontSize: '75%',
    opacity: '0.8',
    '& dd': {
      margin: 0
    }
  }
})

const getUsersTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

const DateWithTimezone = ({ date }) => {
  const classes = useStyles()
  const momentDate = moment(date)

  return (
    <div className={classes.dateWrapper}>
      <span className={classes.date}>{momentDate.format('Do MMM YY')}</span>
      <span className={classes.timezone}>
        {momentDate.format('HH:mm')} ({getUsersTimezone()})
      </span>
    </div>
  )
}

const Assets = ({ tagsToSearch = [] }) => {
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
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets</ErrorMessage>
  }

  // waiting for tags to load
  if (!results) {
    return null
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AssetResults assets={results} />
}

const View = () => {
  const { eventId } = useParams()
  const [isLoading, isError, event] = useDataStoreItem(
    CollectionNames.Events,
    eventId,
    'view-event'
  )
  useBanner(event ? event[EventsFieldNames.bannerUrl] : '')
  const [, , user] = useUserRecord()
  const classes = useStyles()

  if (isLoading || !event) {
    return <LoadingIndicator message="Loading event..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load event</ErrorMessage>
  }

  const {
    [EventsFieldNames.name]: name,
    [EventsFieldNames.description]: description,
    [EventsFieldNames.sourceUrl]: sourceUrl,
    [EventsFieldNames.thumbnailUrl]: thumbnailUrl,
    [EventsFieldNames.assetids]: assetids,
    [EventsFieldNames.discordserverid]: discordserverid,
    [EventsFieldNames.isAdult]: isAdult,
    [EventsFieldNames.startsAt]: startsAt,
    [EventsFieldNames.endsAt]: endsAt,
    [EventsFieldNames.lastModifiedAt]: lastModifiedAt,
    [EventsFieldNames.lastModifiedBy]: lastModifiedBy,
    [EventsFieldNames.createdAt]: createdAt,
    [EventsFieldNames.createdBy]: createdBy,
    [EventsFieldNames.assetTags]: assetTags = []
  } = event

  const canEditThisEvent = getCanUserEditThisEvent(user, event)

  return (
    <>
      <Helmet>
        <title>{name} | VRCArena</title>
        <meta name="description" content={description} />
      </Helmet>
      <div className={classes.root}>
        {canEditThisEvent ? (
          <PaginatedViewControls>
            <Button
              url={routes.editEventWithVar.replace(':eventId', eventId)}
              icon={<EditIcon />}>
              Edit Event
            </Button>
          </PaginatedViewControls>
        ) : null}
        <div className={classes.primary}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Thumbnail for event" width={300} />
          ) : null}
          <Heading variant="h1">
            <Link to={routes.viewEventWithVar.replace(':eventId', eventId)}>
              {name}
            </Link>
          </Heading>
          <div className={classes.dates}>
            {startsAt ? <DateWithTimezone date={startsAt} /> : null}
            {startsAt && endsAt ? (
              <div className={classes.separator}>
                <ArrowForwardIcon />
              </div>
            ) : null}
            {endsAt ? <DateWithTimezone date={endsAt} /> : null}
          </div>
          {sourceUrl ? (
            <div className={classes.controls}>
              <Button size="large" icon={<LaunchIcon />} url={sourceUrl}>
                Visit Website
              </Button>
            </div>
          ) : null}
        </div>
        {description ? (
          <div className={classes.description}>
            <Markdown source={description} />
          </div>
        ) : null}
        <Assets tagsToSearch={assetTags || []} />
        <dl className={classes.meta}>
          {lastModifiedAt ? (
            <dd>
              Last modified <FormattedDate date={lastModifiedAt} />
            </dd>
          ) : null}
          {lastModifiedBy ? (
            <dd>
              Last modified by{' '}
              <UsernameLink id={lastModifiedBy} username="User" />
            </dd>
          ) : null}
          {createdAt ? (
            <dd>
              Created <FormattedDate date={createdAt} />
            </dd>
          ) : null}
          {createdBy ? (
            <dd>
              Created by <UsernameLink id={createdBy} username="User" />
            </dd>
          ) : null}
        </dl>
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
