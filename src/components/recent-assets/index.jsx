import React from 'react'
import Link from '../../components/link'

import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames,
  OrderDirections,
  options,
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../loading-indicator'
import AssetResults from '../asset-results'
import ErrorMessage from '../error-message'
import Button from '../button'
import Heading from '../heading'
import BodyText from '../body-text'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'
import { createRef } from '../../utils'

function getViewMoreLinkUrl(speciesId, categoryName) {
  if (speciesId && categoryName) {
    return routes.viewSpeciesCategoryWithVar
      .replace(':speciesIdOrSlug', speciesId)
      .replace(':categoryName', categoryName)
  }
  if (categoryName) {
    return routes.viewCategoryWithVar.replace(':categoryName', categoryName)
  }
  throw new Error('Cannot get view more link url: no category name!')
}

export default ({
  speciesId = null,
  categoryName = null,
  showPinned,
  limit = 10,
  title = '',
}) => {
  const [, , user] = useUserRecord()

  let whereClauses = [[AssetFieldNames.isAdult, Operators.EQUALS, false]]

  if (speciesId) {
    whereClauses.push([
      AssetFieldNames.species,
      Operators.ARRAY_CONTAINS,
      createRef(CollectionNames.Species, speciesId),
    ])
  }

  if (speciesId === false) {
    whereClauses.push([AssetFieldNames.species, Operators.EQUALS, []])
  }

  if (categoryName) {
    whereClauses.push([
      AssetFieldNames.category,
      Operators.EQUALS,
      categoryName,
    ])
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    'getPublicAssets',
    whereClauses,
    {
      [options.limit]: limit,
      [options.orderBy]: [AssetFieldNames.createdAt, OrderDirections.DESC],
      [options.queryName]: `recent-assets-${speciesId}-${categoryName}`,
    }
  )

  if (isLoading || !results) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get recent assets</ErrorMessage>
  }

  // Some species only have avatars so it looks very empty
  if (!results.length) {
    return null
  }

  return (
    <>
      <Heading variant="h2">
        <Link
          to={
            speciesId
              ? routes.viewSpeciesCategoryWithVar
                  .replace(':speciesIdOrSlug', speciesId)
                  .replace(':categoryName', categoryName)
              : routes.viewCategoryWithVar.replace(
                  ':categoryName',
                  categoryName
                )
          }>
          {title || categoryMeta[categoryName].name}
        </Link>
      </Heading>
      <BodyText>{categoryMeta[categoryName].shortDescription}</BodyText>
      <AssetResults assets={results} showPinned={showPinned} />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        {speciesId && categoryName && (
          <Link
            to={routes.viewCategoryWithVar.replace(
              ':categoryName',
              categoryName
            )}>
            <Button color="default">View All Species</Button>
          </Link>
        )}{' '}
        {user && (
          <Button color="default" url={routes.createAsset}>
            Upload
          </Button>
        )}{' '}
        <Link to={getViewMoreLinkUrl(speciesId, categoryName)}>
          <Button>View More</Button>
        </Link>
      </div>
    </>
  )
}
