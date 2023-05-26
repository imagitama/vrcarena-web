import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  AssetCategories,
  AssetFieldNames,
  Operators,
  OrderDirections,
  GetFullAssetsFieldNames,
  AssetMetaFieldNames,
  ApprovalStatuses,
  AccessStatuses,
  PublishStatuses
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import SimpleResultsItem from '../../components/simple-results-item'
import NoResultsMessage from '../../components/no-results-message'
import Button from '../../components/button'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useUserPreferences from '../../hooks/useUserPreferences'

const useStyles = makeStyles({
  articles: {
    marginTop: '1rem'
  },
  viewAllBtn: {
    marginTop: '2rem',
    textAlign: 'center'
  }
})

const maxDescLength = 100

function getTrucatedDesc(desc) {
  if (desc.length > maxDescLength) {
    return `${desc.substr(0, maxDescLength)}...`
  }
  return desc
}

export default () => {
  const [, , user] = useUserRecord()
  const [, , userPreferences] = useUserPreferences()
  const classes = useStyles()

  let whereClauses = [
    [
      AssetMetaFieldNames.approvalStatus,
      Operators.EQUALS,
      ApprovalStatuses.Approved
    ],
    [AssetMetaFieldNames.accessStatus, Operators.EQUALS, AccessStatuses.Public],
    [
      AssetMetaFieldNames.publishStatus,
      Operators.EQUALS,
      PublishStatuses.Published
    ],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.category, Operators.EQUALS, AssetCategories.article]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to adult content just to be sure
  if (userPreferences && userPreferences.enabledadultcontent === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  const [isLoading, isErrored, articles] = useDatabaseQuery(
    CollectionNames.AssetCache,
    whereClauses,
    10,
    [GetFullAssetsFieldNames.createdAt, OrderDirections.DESC]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load articles</ErrorMessage>
  }

  if (!articles.length) {
    return <NoResultsMessage>No articles found</NoResultsMessage>
  }

  return (
    <div className={classes.articles}>
      {articles.map(
        ({
          id,
          title,
          description,
          createdAt,
          createdBy,
          thumbnailUrl,
          [AssetFieldNames.slug]: slug
        }) => (
          <SimpleResultsItem
            key={id}
            url={routes.viewAssetWithVar.replace(':assetId', slug || id)}
            title={title}
            description={getTrucatedDesc(description)}
            author={createdBy}
            date={createdAt}
            thumbnailUrl={thumbnailUrl}
            onReadMoreBtnClick={() =>
              trackAction('Home', 'Click read more news button', id)
            }
          />
        )
      )}

      <div className={classes.viewAllBtn}>
        <Button
          url={routes.news}
          onClick={() => trackAction('Home', 'Click view all news button')}>
          View All News
        </Button>
      </div>
    </div>
  )
}
