import React from 'react'
import StarIcon from '@material-ui/icons/Star'

import useDatabaseSave from '../../hooks/useDatabaseSave'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'

import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { FeaturedStatus, MetaRecord } from '../../modules/common'

export default ({
  id,
  metaCollectionName,
  existingFeaturedStatus = undefined,
  onClick = undefined,
  onDone = undefined,
}: {
  id: string
  metaCollectionName: string
  existingFeaturedStatus?: FeaturedStatus
  onClick?: ({ newValue }: { newValue: FeaturedStatus }) => void
  onDone?: () => void
}) => {
  const [isLoading, isErroredLoading, metaRecord] =
    useDataStoreItem<MetaRecord>(
      metaCollectionName,
      existingFeaturedStatus !== undefined ? false : id,
      'feature-button'
    )
  const [isSaving, , isErroredSaving, save] = useDatabaseSave(
    metaCollectionName,
    id
  )

  if (isLoading || isSaving) {
    return <LoadingIndicator message={isLoading ? 'Loading...' : 'Saving...'} />
  }

  if (existingFeaturedStatus === undefined && !metaRecord) {
    console.warn(
      'Cannot render feature button: no existing featured status and no meta record'
    )
    return <>Failed to render feature button: missing data</>
  }

  const featuredStatus =
    existingFeaturedStatus !== undefined
      ? existingFeaturedStatus
      : metaRecord
      ? metaRecord.featuredstatus
      : undefined

  if (isErroredLoading || featuredStatus === undefined) {
    return <>Failed to load featured asset data</>
  }

  if (isErroredSaving) {
    return <>Failed to save featured asset data</>
  }

  const toggle = async () => {
    try {
      const newValue =
        featuredStatus === FeaturedStatus.Featured
          ? FeaturedStatus.Unfeatured
          : FeaturedStatus.Featured

      if (onClick) {
        onClick({ newValue })
      }

      await save({
        featuredstatus: newValue,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to toggle status', err)
      handleError(err)
    }
  }

  return (
    <Button color="default" onClick={toggle} icon={<StarIcon />}>
      {featuredStatus === FeaturedStatus.Featured ? 'Unfeature' : 'Feature'}
    </Button>
  )
}
