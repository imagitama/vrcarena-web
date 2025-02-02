import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import DeleteIcon from '@material-ui/icons/Delete'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDataStore from '../../hooks/useDataStore'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import VrchatWorld from '../vrchat-world'
import {
  CachedVrchatWorldRecord,
  VrchatWorld as VrchatWorldStructure,
} from '../../modules/vrchat-cache'
import Button from '../button'
import { SupabaseClient } from '@supabase/supabase-js'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
})

export default ({
  worldIds,
  showControls = false,
  onRemove,
  onUseForAsset,
}: {
  worldIds: string[]
  showControls?: boolean
  onRemove?: (id: string) => void
  onUseForAsset?: (id: string, worldData: VrchatWorldStructure | null) => void
}) => {
  const getQuery = useCallback(
    (supabase: SupabaseClient) =>
      worldIds.length === 0
        ? null
        : supabase
            .from(CollectionNames.VrchatWorlds)
            .select('*')
            .or(worldIds.map((worldId) => `id.eq.${worldId}`).join(',')),
    [worldIds.join(',')]
  )
  const [isLoading, lastErrorCode, results] =
    useDataStore<CachedVrchatWorldRecord>(getQuery, 'vrchat-worlds')
  const classes = useStyles()

  if (!worldIds) {
    return <ErrorMessage>No VRChat worlds have been set</ErrorMessage>
  }

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to get worlds</ErrorMessage>
  }

  return (
    <div className={classes.root}>
      {worldIds.map((worldId) => {
        const cachedRecord = results
          ? results.find((result) => result.id === worldId)
          : undefined

        const worldData = cachedRecord ? cachedRecord.world : null

        return (
          <div key={worldId}>
            <VrchatWorld
              worldId={worldId}
              worldData={worldData}
              showControls={showControls}
            />
            {showControls && onRemove && onUseForAsset && (
              <>
                <Button
                  icon={<DeleteIcon />}
                  color="default"
                  onClick={() => onRemove(worldId)}>
                  Remove
                </Button>{' '}
                <Button
                  color="default"
                  onClick={() => onUseForAsset(worldId, worldData)}>
                  Use For Asset
                </Button>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
