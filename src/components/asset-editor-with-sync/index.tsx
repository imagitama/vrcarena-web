import React, { useState, useEffect } from 'react'

import NoPermissionMessage from '../../components/no-permission-message'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'

import useUserRecord from '../../hooks/useUserRecord'
import { readRecord } from '../../data-store'
import { Asset, FullAsset } from '../../modules/assets'
import { handleError } from '../../error-handling'

import AssetEditor, {
  EditorContext,
  getSourceTypeFromUrl,
  sourceTypes,
  useEditor
} from '../../components/asset-editor'
import Heading from '../../components/heading'
import SyncWithGumroadForm from '../../components/sync-with-gumroad-form'
import SyncWithBoothForm from '../sync-with-booth-form'

const SyncForm = () => {
  const {
    setNewField,
    setNewFields,
    asset,
    assetId,
    setIsSyncFormVisible,
    hydrate
  } = useEditor()

  if (!asset) {
    return null
  }

  const url = asset.sourceurl

  const sourceType = getSourceTypeFromUrl(url)

  switch (sourceType) {
    case sourceTypes.Gumroad:
      return assetId ? (
        <SyncWithGumroadForm
          assetId={assetId}
          existingGumroadUrl={url}
          // @ts-ignore
          onFieldsChanged={setNewFields}
          onFieldChanged={setNewField}
          onDone={() => {
            setNewFields(null)
            setIsSyncFormVisible(false)
            hydrate()
          }}
          onCancel={() => setIsSyncFormVisible(false)}
        />
      ) : (
        <>Need an asset ID</>
      )
    case sourceTypes.Booth:
      return (
        <SyncWithBoothForm
          assetId={assetId}
          existingBoothUrl={url}
          // @ts-ignore
          onFieldsChanged={setNewFields}
          // @ts-ignore
          onFieldChanged={setNewField}
          // @ts-ignore
          onDone={() => {
            setNewFields(null)
            setIsSyncFormVisible(false)
            hydrate()
          }}
          // @ts-ignore
          onCancel={() => setIsSyncFormVisible(false)}
        />
      )
    default:
      return <>Cannot sync</>
  }
}

export default ({ assetId }: { assetId: string }) => {
  const [, , user] = useUserRecord()
  const [isError, setIsError] = useState(false)
  const [isHydrating, setIsHydrating] = useState(false)
  const [assetRecord, setAssetRecord] = useState<FullAsset | null>(null)
  const [newFields, setNewFields] = useState<Asset | null>(null)
  const [isSyncFormVisible, setIsSyncFormVisible] = useState(false)

  const hydrate = async () => {
    if (!assetId) {
      return
    }

    setIsHydrating(true)
    setIsError(false)

    try {
      const rawAssetFields = await readRecord<FullAsset>(
        'getFullAssets'.toLowerCase(),
        assetId
      )

      // fix up old assets that do not default stuff
      if (!rawAssetFields.tags) {
        rawAssetFields.tags = []
      }

      setAssetRecord(rawAssetFields)
      setIsError(false)
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsError(true)
    }

    setIsHydrating(false)
  }

  const setNewField = (fieldName: string, newValue: any) =>
    // @ts-ignore
    setNewFields(currentFields => ({
      ...currentFields,
      [fieldName]: newValue
    }))

  useEffect(() => {
    if (!assetId) {
      return
    }
    hydrate()
  }, [assetId])

  if (!assetRecord) {
    return <LoadingIndicator message="Loading asset..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  if (!user) {
    return <NoPermissionMessage />
  }

  return (
    <EditorContext.Provider
      value={{
        assetId: assetRecord ? assetRecord.id : null,
        asset: assetRecord,
        hydrate,
        isHydrating,
        newFields,
        setNewFields,
        setNewField,
        setIsSyncFormVisible,
        isEditingAllowed: !isSyncFormVisible
      }}>
      <Heading variant="h1">
        {assetId
          ? `Edit ${
              assetRecord.title ? `"${assetRecord.title}"` : '(untitled)'
            }`
          : 'Create Asset'}
      </Heading>
      {isSyncFormVisible ? <SyncForm /> : null}
      <AssetEditor />
    </EditorContext.Provider>
  )
}
