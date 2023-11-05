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
  onDone = undefined
}: {
  id: string
  metaCollectionName: string
  existingFeaturedStatus?: FeaturedStatus
  onClick?: ({ newValue }: { newValue: FeaturedStatus }) => void
  onDone?: () => void
}) => {
  const [isLoading, isErroredLoading, metaRecord] = useDataStoreItem<
    MetaRecord
  >(
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

  if (!existingFeaturedStatus && !metaRecord) {
    return <>No record found</>
  }

  const featuredStatus = existingFeaturedStatus
    ? existingFeaturedStatus
    : metaRecord
    ? metaRecord.featuredstatus
    : undefined

  if (isErroredLoading || !featuredStatus) {
    return <>Failed to load record!</>
  }

  if (isErroredSaving) {
    return <>Failed to save record!</>
  }

  const toggle = async () => {
    try {
      if (!featuredStatus) {
        throw new Error('Cannot toggle - invalid initial status!')
      }

      const newValue =
        featuredStatus === FeaturedStatus.Featured
          ? FeaturedStatus.Unfeatured
          : FeaturedStatus.Featured

      if (onClick) {
        onClick({ newValue })
      }

      await save({
        featuredstatus: newValue
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
