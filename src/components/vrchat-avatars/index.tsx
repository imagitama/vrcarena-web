import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDataStore from '../../hooks/useDataStore'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import VrchatAvatar from '../vrchat-avatar'
import PublicAvatarForm from '../public-avatar-form'
import { CachedVrchatAvatarRecord } from '../../modules/public-avatars'
import FindMoreAssetsButton from '../find-more-assets-button'
import { SupabaseClient } from '@supabase/supabase-js'

const useStyles = makeStyles({
  avatars: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
})

export default ({
  avatarIds,
  assetId,
  showAddButton,
}: {
  avatarIds: string[]
  assetId?: string
  showAddButton?: boolean
}) => {
  const getQuery = useCallback(
    (supabase: SupabaseClient) =>
      avatarIds.length === 0
        ? null
        : supabase
            .from(CollectionNames.VrchatAvatars)
            .select('*')
            .or(avatarIds.map((avatarId) => `id.eq.${avatarId}`).join(',')),
    [avatarIds.join(',')]
  )
  const [isLoading, lastErrorCode, results] =
    useDataStore<CachedVrchatAvatarRecord>(getQuery, 'vrchat-avatars')
  const classes = useStyles()
  const [isAddFormVisible, setIsAddFormVisible] = useState(false)

  if (!avatarIds) {
    return <ErrorMessage>No VRChat avatars have been set</ErrorMessage>
  }

  if (isLoading || !results) {
    return <LoadingIndicator />
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to get avatars</ErrorMessage>
  }

  return (
    <div>
      <div className={classes.avatars}>
        {avatarIds.map((avatarId) => {
          const vrchatAvatarRecord = results.find(
            (result) => result.id === avatarId
          )

          return (
            <VrchatAvatar
              key={avatarId}
              avatarId={avatarId}
              avatarData={
                vrchatAvatarRecord ? vrchatAvatarRecord.avatar : undefined
              }
            />
          )
        })}
        {showAddButton && assetId ? (
          <FindMoreAssetsButton
            icon={<PlaylistAddIcon />}
            label="Add Avatar"
            onClick={() => setIsAddFormVisible((currentVal) => !currentVal)}
          />
        ) : null}
      </div>
      {isAddFormVisible && assetId ? (
        <PublicAvatarForm assetId={assetId} isExpanded />
      ) : null}
    </div>
  )
}
