import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Asset,
  PublicAsset,
  Relation,
  RelationType
} from '../../modules/assets'
import AssetResultsItem from '../asset-results-item'
import Markdown from '../markdown'
import { client as supabase } from '../../supabase'
import useDataStore from '../../hooks/useDataStore'
import LoadingIndicator from '../loading-indicator'
import NoResultsMessage from '../no-results-message'
import ErrorMessage from '../error-message'
import AssetResultsItemParent from '../asset-results-item-parent'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  relationType: {
    margin: '0 0.5rem 0.5rem 0'
  },
  relations: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  relation: {
    position: 'relative',
    height: '100%',
    margin: '0 0.5rem 0.5rem 0'
  },
  label: {
    fontSize: '150%',
    marginBottom: '0.5rem'
  },
  comments: {
    marginTop: '0.5rem',
    fontStyle: 'italic',
    '& > p:last-child': {
      marginBottom: 0
    }
  },
  itemLabel: {
    marginTop: '0.5rem'
  }
})

export const getLabelForType = (relationType: string): string => {
  switch (relationType) {
    case RelationType.Parent:
      return 'Parent'
    case RelationType.Similar:
      return 'Similar'
    case RelationType.Suggested:
      return 'Suggested'
    case RelationType.Other:
      return 'Other'
    default:
      return 'Unknown'
  }
}

export const Relations = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()

  return <div className={classes.relations}>{children}</div>
}

export const RelationItem = ({
  relation,
  asset,
  showRelation
}: {
  relation: Relation
  asset: PublicAsset
  showRelation?: boolean
}) => {
  const classes = useStyles()

  return (
    <div className={classes.relation}>
      {showRelation ? <AssetResultsItemParent parent={asset} /> : null}
      <AssetResultsItem asset={asset} pushDownIcons={showRelation} />
      {relation.comments ? (
        <div className={classes.comments}>
          <Markdown source={relation.comments} />
        </div>
      ) : null}
    </div>
  )
}

export default ({ relations }: { relations: Relation[] }) => {
  const getQuery = useCallback(
    () =>
      supabase
        .from('getpublicassets')
        .select('*')
        .or(relations.map(({ asset }) => `id.eq.${asset}`).join(',')),
    [relations.map(({ asset }) => asset).join('+')]
  )
  const [isLoadingAssets, isErrorLoadingAssets, assets] = useDataStore<
    PublicAsset[]
  >(getQuery, 'relations')
  const classes = useStyles()

  const relationsWithData = assets
    ? relations.filter(relation =>
        assets.find(({ id }) => id === relation.asset)
      )
    : []

  const relationsByType = relationsWithData.reduce<{
    [type: string]: Relation[]
  }>(
    (final, relation) => ({
      ...final,
      [relation.type]:
        relation.type in final
          ? final[relation.type].concat([relation])
          : [relation]
    }),
    {}
  )

  if (isErrorLoadingAssets) {
    return <ErrorMessage>Failed to load relations</ErrorMessage>
  }

  if (isLoadingAssets || !assets) {
    return <LoadingIndicator />
  }

  if (!assets.length) {
    return <NoResultsMessage>No relations found</NoResultsMessage>
  }

  return (
    <div className={classes.root}>
      {Object.entries(relationsByType).map(
        ([relationType, relationsForType]) => (
          <div className={classes.relationType}>
            <div className={classes.label}>{getLabelForType(relationType)}</div>
            <Relations>
              {relationsForType.map(relation => {
                const asset = assets.find(({ id }) => id === relation.asset)

                if (!asset) {
                  throw new Error(
                    `Could not get asset for ID ${relation.asset}`
                  )
                }

                return (
                  <RelationItem
                    key={relationType}
                    relation={relation}
                    asset={asset}
                  />
                )
              })}
            </Relations>
          </div>
        )
      )}
    </div>
  )
}
