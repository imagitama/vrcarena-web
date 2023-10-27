import React from 'react'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import { CollectionNames, Tag } from '../../modules/tags'
import AssetFeatures from '../asset-features'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'

const useFeatures = () =>
  useDataStoreItems<Tag>(CollectionNames.Tags, 'features')

const FeaturesEditor = ({ currentTags }: { currentTags: string[] }) => {
  const isEditing = false
  const [isLoadingFeatures, isErrorLoadingFeatures, features] = useFeatures()

  if (isLoadingFeatures || !features) {
    return <LoadingIndicator message="Loading features..." />
  }

  if (isErrorLoadingFeatures) {
    return <ErrorMessage>Failed to load features</ErrorMessage>
  }

  if (!isEditing) {
    return <AssetFeatures tags={currentTags} tagsData={features} />
  }

  return <>Editing!</>
}

export default FeaturesEditor
