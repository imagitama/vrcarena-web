import React from 'react'
import LoyaltyIcon from '@material-ui/icons/Loyalty'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'

export default ({ assetId, isAdult, onDone, overrideSave = null }) => {
  const [isSaving, , , save] = useDatabaseSave(CollectionNames.Assets, assetId)

  const onToggleClick = async () => {
    try {
      if (isSaving) {
        return
      }

      const newIsAdultValue = !isAdult

      if (overrideSave) {
        overrideSave(newIsAdultValue)

        if (onDone) {
          onDone()
        }
        return
      }

      await save({
        [AssetFieldNames.isAdult]: newIsAdultValue
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset is adult', err)
      handleError(err)
    }
  }

  return (
    <>
      <Button icon={<LoyaltyIcon />} onClick={onToggleClick}>
        {isSaving ? 'Saving...' : isAdult ? 'Mark as SFW' : 'Mark as NSFW'}
      </Button>
    </>
  )
}
