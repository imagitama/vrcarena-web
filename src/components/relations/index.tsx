import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Asset,
  PublicAsset,
  Relation,
  RelationType,
  ViewNames,
} from '../../modules/assets'
import AssetResultsItem from '../asset-results-item'
import Markdown from '../markdown'
import useDataStore from '../../hooks/useDataStore'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import { SupabaseClient } from '@supabase/supabase-js'
import Paper from '../paper'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  relationType: {
    margin: '0 0.5rem 0.5rem 0',
  },
  relations: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  relation: {
    width: '200px', // fix comments outside of bounds
    position: 'relative',
    height: '100%',
    margin: '0 0.5rem 0.5rem 0',
  },
  label: {
    fontSize: '150%',
    marginBottom: '0.5rem',
  },
  itemLabel: {
    marginTop: '0.5rem',
  },
  comments: {
    marginTop: '0.25rem',
  },
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

export const RelationsItems = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()

  return <div className={classes.relations}>{children}</div>
}

export const RelationItem = ({
  relation,
  asset,
  showRelation,
}: {
  relation: Relation
  asset: Asset | PublicAsset
  showRelation?: boolean
}) => {
  const classes = useStyles()

  return (
    <div className={classes.relation}>
      <AssetResultsItem
        asset={asset}
        relation={showRelation ? relation : undefined}
      />
      {relation.comments ? (
        <Paper className={classes.comments}>
          <Markdown source={relation.comments} />
        </Paper>
      ) : null}
    </div>
  )
}

const Relations = ({ relations }: { relations: Relation[] }) => {
  const hasRelations = relations && relations.length

  const getQuery = useCallback(
    (supabase: SupabaseClient) =>
      hasRelations
        ? supabase
            .from(ViewNames.GetPublicAssets)
            .select('*')
            .or(relations.map(({ asset }) => `id.eq.${asset}`).join(','))
        : null,
    [hasRelations, relations.map(({ asset }) => asset).join('+')]
  )
  const [isLoadingAssets, lastErrorCodeLoadingAssets, assets] =
    useDataStore<PublicAsset>(getQuery, 'relations')
  const classes = useStyles()

  const relationsWithData = assets
    ? relations.filter((relation) =>
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
          : [relation],
    }),
    {}
  )

  if (lastErrorCodeLoadingAssets !== null) {
    return <ErrorMessage>Failed to load relations</ErrorMessage>
  }

  if (hasRelations && (isLoadingAssets || !assets)) {
    return <LoadingIndicator message="Loading relations..." />
  }

  return (
    <div className={classes.root}>
      {Object.entries(relationsByType).map(
        ([relationType, relationsForType]) => (
          <div className={classes.relationType}>
            <div className={classes.label}>{getLabelForType(relationType)}</div>
            <RelationsItems>
              {relationsForType.map((relation) => {
                const asset = assets
                  ? assets.find(({ id }) => id === relation.asset)
                  : null

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
            </RelationsItems>
          </div>
        )
      )}
    </div>
  )
}

export default Relations
