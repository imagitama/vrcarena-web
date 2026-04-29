import React, { useCallback, useState } from 'react'
import { makeStyles } from '@mui/styles'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import { SupabaseClient } from '@supabase/supabase-js'

import { VrchatAvatarCachedItem } from '@/modules/vrchat-cache'
import { CollectionNames } from '@/modules/vrchatavatars'

import useDataStore from '@/hooks/useDataStore'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import VrchatAvatar from '@/components/vrchat-avatar'
import PublicAvatarForm from '@/components/public-avatar-form'
import FindMoreAssetsButton from '@/components/find-more-assets-button'

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
    useDataStore<VrchatAvatarCachedItem>(getQuery, 'vrchat-avatars')
  const classes = useStyles()
  const [isAddFormVisible, setIsAddFormVisible] = useState(false)

  if (!avatarIds) {
    return <ErrorMessage>No VRChat avatars have been set</ErrorMessage>
  }

  if (isLoading || !results) {
    return <LoadingIndicator />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to get avatars (code {lastErrorCode})</ErrorMessage>
    )
  }

  return (
    <div>
      <div className={classes.avatars}>
        {avatarIds.map((avatarId) => {
          const cachedAvatarItem = results.find(
            (result) => result.id === avatarId
          )

          return (
            <VrchatAvatar
              key={avatarId}
              avatarId={avatarId}
              avatarData={
                cachedAvatarItem ? cachedAvatarItem.avatar : undefined
              }
              thumbnailUrl={
                cachedAvatarItem ? cachedAvatarItem.thumbnailurl : undefined
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
