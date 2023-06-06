import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import LaunchIcon from '@material-ui/icons/Launch'
import { makeStyles } from '@material-ui/core/styles'

import * as routes from '../../routes'
import { client as supabase } from '../../supabase'

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
import events from '../../events'
import { FullAuthor } from '../../modules/authors'
import AuthorResultsItem from '../../components/author-results-item'
import SaleInfo from '../../components/sale-info'

const useStyles = makeStyles({
  root: { position: 'relative' },
  primary: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
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
  },
  authors: {},
  authorItem: {
    display: 'flex',
    marginBottom: '0.5rem',
    '& > :last-child': {
      width: '100%',
      padding: '0.5rem'
    }
  }
})

const getUsersTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

// const DateWithTimezone = ({ date }: { date: Date }) => {
//   const classes = useStyles()
//   const momentDate = moment(date)

//   return (
//     <div className={classes.dateWrapper}>
//       <span className={classes.date}>{momentDate.format('Do MMM YY')}</span>
//       <span className={classes.timezone}>
//         {momentDate.format('HH:mm')} ({getUsersTimezone()})
//       </span>
//     </div>
//   )
// }

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
      {authors.map(author => (
        <div key={author.id} className={classes.authorItem}>
          <div>
            <AuthorResultsItem author={author} />
          </div>
          <div>
            <SaleInfo
              authorId={author.id}
              reason={author.salereason}
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

const AuthorsWithSales = ({ eventName }: { eventName: string }) => {
  const getQuery = useCallback(() => {
    const fixedReason = eventName.replaceAll('-', '_')

    let query = supabase
      .from('getPublicAuthors'.toLowerCase())
      .select('*')
      .eq(AuthorFieldNames.saleReason, fixedReason)

    return query
  }, [eventName])
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
  const { eventName } = useParams<{ eventName: string }>()
  const classes = useStyles()

  if (!(eventName in events)) {
    return <ErrorMessage>Event not found</ErrorMessage>
  }

  const { title, description, thumbnailUrl, sourceUrl, assetTags } = events[
    eventName
  ]

  return (
    <>
      <Helmet>
        <title>{`${title} | VRCArena`}</title>
        <meta name="description" content={description} />
      </Helmet>
      <div className={classes.root}>
        <div className={classes.primary}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Thumbnail for event" width={300} />
          ) : null}
          <Heading variant="h1">
            <Link to={routes.viewEventWithVar.replace(':eventName', eventName)}>
              {title}
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
          {sourceUrl ? (
            <div className={classes.controls}>
              <Button size="large" icon={<LaunchIcon />} url={sourceUrl}>
                Visit Website
              </Button>
            </div>
          ) : null}
          {description ? (
            <div className={classes.description}>
              <Markdown source={description} />
            </div>
          ) : null}
        </div>
        <AuthorsWithSales eventName={eventName} />
        <Assets tagsToSearch={assetTags || []} />
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
