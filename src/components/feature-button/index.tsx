import React from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import StarIcon from '@mui/icons-material/Star'

import { handleError } from '@/error-handling'
import { FeaturedStatus, MetaRecord } from '@/modules/common'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useDataStoreItem from '@/hooks/useDataStoreItem'

import Button, { ButtonProps } from '@/components/button'
import LoadingIndicator from '@/components/loading-indicator'

const FeatureButton = ({
  id,
  metaCollectionName,
  existingFeaturedStatus = undefined,
  onClick = undefined,
  onDone = undefined,
  ...buttonProps
}: {
  id: string
  metaCollectionName: string
  existingFeaturedStatus?: FeaturedStatus
  onClick?: ({ newValue }: { newValue: FeaturedStatus }) => void
  onDone?: () => void
} & ButtonProps) => {
  const [isLoading, lastErrorCodeLoading, metaRecord] =
    useDataStoreItem<MetaRecord>(
      metaCollectionName,
      existingFeaturedStatus !== undefined ? false : id,
      { queryName: 'feature-button' }
    )
  const [isSaving, , lastErrorCodeSaving, save] = useDataStoreEdit<MetaRecord>(
    metaCollectionName,
    id
  )

  if (isLoading || isSaving) {
    return <LoadingIndicator message={isLoading ? 'Loading...' : 'Saving...'} />
  }

  if (!existingFeaturedStatus && !metaRecord) {
    console.warn(
      'Cannot render button: no existing access status and no meta record'
    )
    return null
  }

  const featuredStatus =
    existingFeaturedStatus || (metaRecord ? metaRecord.accessstatus : undefined)

  if (lastErrorCodeLoading !== null) {
    return <>Failed to load record (code {lastErrorCodeLoading})</>
  }

  if (!featuredStatus) {
    return <>Failed to load record (invalid access status)</>
  }

  if (lastErrorCodeSaving !== null) {
    return <>Failed to save record (code {lastErrorCodeSaving})</>
  }

  const toggle = async () => {
    try {
      if (!featuredStatus) {
        throw new Error('Cannot toggle access - invalid initial status!')
      }

      const newFeaturedStatus =
        featuredStatus === FeaturedStatus.Featured
          ? FeaturedStatus.Unfeatured
          : FeaturedStatus.Featured

      if (onClick) {
        onClick({ newValue: newFeaturedStatus })
      }

      await save({
        featuredstatus: newFeaturedStatus,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to toggle deleted status', err)
      handleError(err)
    }
  }

  return (
    <Button
      onClick={toggle}
      icon={<StarIcon />}
      size="small"
      color="secondary"
      {...buttonProps}>
      {featuredStatus === FeaturedStatus.Featured ? 'Un-feature' : 'Feature'}
    </Button>
  )
}

export default FeatureButton
