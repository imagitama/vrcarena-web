import React from 'react'
import { Asset, CollectionNames, FullAsset, ViewNames } from '@/modules/assets'
import { getCanAssetBePublished } from '@/utils/assets'

import GenericEditor from '@/components/generic-editor'
import FormControls from '@/components/form-controls'
import PublishAssetButton from '@/components/publish-asset-button'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'

const AssetEditor = ({
  assetId,
  onDone,
  // amendments
  overrideFields,
  onFieldChanged,
}: {
  assetId: string | null // null for amendment editor
  onDone?: () => void
  // amendments
  overrideFields?: Asset
  onFieldChanged?: (fieldName: string, fieldValue: any) => void
}) => {
  const [isLoading, lastErrorCode, asset] = useDataStoreItem<FullAsset>(
    ViewNames.GetFullAssets,
    assetId || false
  )

  if (assetId && (isLoading || asset === null)) {
    return <LoadingIndicator message="Loading asset..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load asset (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (asset === false) {
    return <NoResultsMessage>No asset found with that ID</NoResultsMessage>
  }

  return (
    <>
      {assetId && asset && (
        <FormControls>
          <PublishAssetButton
            assetId={assetId}
            asset={asset}
            enableRedirect={false}
            isDisabled={!getCanAssetBePublished(asset)}
          />
        </FormControls>
      )}
      <GenericEditor
        isAccordion
        startExpanded
        collectionName={CollectionNames.Assets}
        id={assetId}
        onDone={onDone}
        itemTypeSingular="Asset"
        showTopSaveBtn
        scrollDisabled
        // amendments
        overrideFields={overrideFields}
        onFieldChanged={onFieldChanged}
      />
    </>
  )
}

export default AssetEditor
