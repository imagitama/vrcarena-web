import React from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'
import { makeStyles } from '@material-ui/styles'
import ArrowRightIcon from '@material-ui/icons/ArrowRight'
import AccountTreeIcon from '@material-ui/icons/AccountTree'
import Tooltip from '@material-ui/core/Tooltip'

import Link from '../../components/link'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import * as routes from '../../routes'
import { getRankById, items } from '../../taxonomy'
import {
  capitalize,
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  insertItemInbetweenAllItems
} from '../../utils'
import Markdown from '../../components/markdown'
import { TaxonomyItem } from '../../taxonomy'
import { findAncestorsForId, getSiblings } from '../../taxonomy/utils'
import AssetResults from '../../components/asset-results'
import ErrorMessage from '../../components/error-message'
import NoResultsMessage from '../../components/no-results-message'
import LoadingIndicator from '../../components/loading-indicator'
import useDatabaseQuery, {
  AssetFieldNames,
  Operators,
  options,
  OrderDirections,
  WhereClause
} from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { Asset } from '../../modules/assets'
import Button from '../../components/button'

const useStyles = makeStyles({
  rows: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    fontSize: '125%'
  },
  row: {
    display: 'flex',
    width: '100%',
    alignItems: 'center'
  },
  label: {
    minWidth: '10%',
    padding: '0.5rem',
    fontWeight: 'bold'
  },
  value: {
    width: '70%',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center'
  },
  items: { display: 'flex', alignItems: 'center', marginRight: '0.5rem' },
  separator: {
    padding: '0 0.5rem'
  }
})

const AssetsWithRank = ({ rankId }: { rankId: string }) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  let whereClauses: WhereClause[] = [
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.ranks, Operators.ARRAY_CONTAINS, rankId]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to adult content just to be sure
  if (isAdultContentEnabled === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  const [isLoading, isErrored, results] = useDatabaseQuery<Asset>(
    'getPublicAssets',
    whereClauses,
    {
      [options.limit]: 10,
      [options.orderBy]: [AssetFieldNames.createdAt, OrderDirections.DESC],
      [options.queryName]: `recent-assets-for-rank-${rankId}`
    }
  )

  if (isLoading || !results || !Array.isArray(results)) {
    return <LoadingIndicator message="Loading assets for this rank..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets for this rank</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage>No assets found for this rank</NoResultsMessage>
  }

  return <AssetResults assets={results} />
}

const ItemsOutput = ({
  items,
  asChildren = false
}: {
  items: TaxonomyItem[]
  asChildren?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={classes.items}>
      {insertItemInbetweenAllItems(
        items.map(item => (
          <div key={item.id}>
            <Tooltip
              arrow
              title={`${item.description || item.scientificName} (${
                item.rank
              })`}>
              <span>
                <Link to={routes.viewRankWithVar.replace(':rankId', item.id)}>
                  {item.canonicalName || item.scientificName}
                </Link>
              </span>
            </Tooltip>
          </div>
        )),
        <>
          {' '}
          {asChildren ? (
            <ArrowRightIcon />
          ) : (
            <span className={classes.separator}> | </span>
          )}{' '}
        </>
      )}
    </div>
  )
}

export default () => {
  const { rankId } = useParams<{ rankId: string }>()
  const classes = useStyles()

  const rankDetails = getRankById(rankId)

  if (!rankDetails) {
    return <>Failed to find rank "{rankId}"</>
  }

  const {
    rank,
    canonicalName,
    scientificName,
    description,
    thumbnailUrl,
    children
  } = rankDetails

  const titleWithoutSuffix = `${canonicalName} | ${scientificName}`

  // TODO: Why does it include itself
  const ancestorsIncludingItself = findAncestorsForId(items, rankDetails.id)
  const parents =
    ancestorsIncludingItself.length > 1
      ? ancestorsIncludingItself.slice(0, -1)
      : []

  const siblings =
    parents.length >= 2
      ? parents[parents.length - 2].children.filter(
          child => child.id !== rankId
        )
      : []

  return (
    <div>
      <Helmet>
        <title>{titleWithoutSuffix} | VRCArena</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={titleWithoutSuffix} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={getDescriptionForHtmlMeta(description)}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewRankWithVar.replace(':rankId', rankId)
          )}
        />
        <meta property="og:image" content={thumbnailUrl} />
      </Helmet>
      <Heading variant="h1">
        {capitalize(rank)}:{' '}
        <Link to={routes.viewRankWithVar.replace(':rankId', rankId)}>
          {canonicalName}
        </Link>
      </Heading>
      <div className={classes.rows}>
        <div className={classes.row}>
          <div className={classes.label}>Parents</div>
          <div className={classes.value}>
            {parents.length ? <ItemsOutput items={parents} asChildren /> : null}{' '}
            <Button
              url={routes.ranksWithQueryParams
                .replace(
                  ':rankIds',
                  [rankId].concat(parents.map(parent => parent.id)).join(',')
                )
                .replace(':primaryRankId', rankId)}
              icon={<AccountTreeIcon />}>
              View In Tree
            </Button>
          </div>
        </div>
        {canonicalName ? (
          <div className={classes.row}>
            <div className={classes.label}>Common Name</div>
            <div className={classes.value}>{canonicalName}</div>
          </div>
        ) : null}
        {scientificName && scientificName !== canonicalName ? (
          <div className={classes.row}>
            <div className={classes.label}>Scientific Name</div>
            <div className={classes.value}>{scientificName}</div>
          </div>
        ) : null}
        {children.length ? (
          <div className={classes.row}>
            <div className={classes.label}>Children</div>
            <div className={classes.value}>
              <ItemsOutput items={children} />
            </div>
          </div>
        ) : null}
        {siblings.length ? (
          <div className={classes.row}>
            <div className={classes.label}>Siblings</div>
            <div className={classes.value}>
              <ItemsOutput items={siblings} />
            </div>
          </div>
        ) : null}
      </div>
      {description ? (
        <BodyText>
          <Markdown source={description} />
        </BodyText>
      ) : null}
      <AssetsWithRank rankId={rankId} />
    </div>
  )
}
