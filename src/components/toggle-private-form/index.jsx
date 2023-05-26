import React from 'react'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'
import PublishIcon from '@material-ui/icons/Publish'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'

export default ({ assetId, isPrivate, onDone, ...props }) => {
  const userId = useUserId()
  const [isSaving, , , save] = useDatabaseSave(CollectionNames.Assets, assetId)

  const onPublish = async () => {
    try {
      await save({
        [AssetFieldNames.isPrivate]: false
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset as not private', err)
      handleError(err)
    }
  }

  return (
    <>
      <Button
        icon={isPrivate ? <PublishIcon /> : <VisibilityOffIcon />}
        color="tertiary"
        onClick={!isSaving && onPublish}
        isDisabled={!isPrivate}
        {...props}>
        {isSaving
          ? 'Saving...'
          : isPrivate
          ? 'Publish Asset'
          : 'Unpublish Asset'}
      </Button>
      {!isPrivate ? (
        <div style={{ fontSize: '75%' }}>
          (use the Report button to submit a takedown request)
        </div>
      ) : (
        ''
      )}
    </>
  )
}
