import React, { useContext } from 'react'
import { AssetFieldNames } from '../../../../hooks/useDatabaseQuery'
import VrchatAvatars from '../../../vrchat-avatars'
import PublicAvatarForm from '../../../public-avatar-form'
import TabContext from '../../context'
import NoResultsMessage from '../../../no-results-message'

// assume this tab is only rendered if tab is inserted in overview
export default () => {
  const { assetId, asset } = useContext(TabContext)

  if (!asset) {
    return null
  }

  if (
    !asset[AssetFieldNames.vrchatClonableAvatarIds] ||
    !asset[AssetFieldNames.vrchatClonableAvatarIds].length
  ) {
    return (
      <>
        <NoResultsMessage>No VRChat avatars found</NoResultsMessage>
        <PublicAvatarForm assetId={assetId} />
      </>
    )
  }

  return (
    <>
      <VrchatAvatars
        avatarIds={asset[AssetFieldNames.vrchatClonableAvatarIds] || []}
        assetId={assetId}
        showAddButton
      />
    </>
  )
}
