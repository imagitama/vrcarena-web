import React from 'react'
import LoyaltyIcon from '@mui/icons-material/Loyalty'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'

import Button from '../button'
import WarningMessage from '../warning-message'
import { Asset, CollectionNames } from '../../modules/assets'

export default ({
  assetId,
  isAdult,
  onDone,
  overrideSave = undefined,
}: {
  assetId: string
  isAdult: boolean
  onDone: () => void
  overrideSave?: (newValue: boolean) => void
}) => {
  const [isSaving, , , save] = useDatabaseSave<Asset>(
    CollectionNames.Assets,
    assetId
  )

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
        isadult: newIsAdultValue,
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
      <WarningMessage leftAlign>
        Please do not mark as NSFW if there is both a SFW and NSFW variation of
        the asset (use tags to indicate that)
      </WarningMessage>
      <Button icon={<LoyaltyIcon />} onClick={onToggleClick}>
        {isSaving
          ? 'Saving...'
          : isAdult
          ? 'Mark as SFW (visible by default)'
          : 'Mark as NSFW (hide by default)'}
      </Button>
    </>
  )
}
