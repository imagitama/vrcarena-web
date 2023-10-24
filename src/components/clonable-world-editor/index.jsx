import React, { useState } from 'react'

import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'

import SearchForIdForm from '../search-for-id-form'
import Button from '../button'

const analyticsCategoryName = 'ViewAssetEditor'

export default ({
  assetId,
  clonableWorld = null,
  onDone,
  overrideSave = null
}) => {
  const userId = useUserId()
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [newClonableWorldId, setNewClonableWorldId] = useState(
    clonableWorld ? clonableWorld.id : null
  )

  if (!userId) {
    return 'You are not logged in'
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isSuccess) {
    return 'Asset saved successfully'
  }

  if (isFailed) {
    return 'Error saving asset'
  }

  const onSaveBtnClick = async () => {
    try {
      const newVal = createRef(CollectionNames.Assets, newClonableWorldId)

      if (overrideSave) {
        overrideSave(newVal)
        onDone()
        return
      }

      trackAction(
        analyticsCategoryName,
        'Click save clonable world editor button',
        assetId
      )

      await save({
        [AssetFieldNames.clonableWorld]: newVal
      })

      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      {newClonableWorldId && `You have selected: ${newClonableWorldId}`}

      <SearchForIdForm
        indexName={CollectionNames.Assets}
        fieldAsLabel={AssetFieldNames.title}
        onClickWithIdAndDetails={id => {
          setNewClonableWorldId(id)
        }}
      />

      <Button onClick={onSaveBtnClick}>Save</Button>
    </>
  )
}
