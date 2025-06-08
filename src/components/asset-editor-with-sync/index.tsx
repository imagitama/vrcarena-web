import React, { useState, useEffect } from 'react'

import NoPermissionMessage from '../../components/no-permission-message'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'

import useUserRecord from '../../hooks/useUserRecord'
import { readRecord } from '../../data-store'
import {
  Asset,
  CollectionNames,
  FullAsset,
  ViewNames,
} from '../../modules/assets'
import { handleError } from '../../error-handling'

import AssetEditor, {
  EditorContext,
  useEditor,
} from '../../components/asset-editor'
import Heading from '../../components/heading'
import SyncForm from '../../components/sync-form'
import ExperimentalArea from '../experimental-area'
import useSupabaseClient from '../../hooks/useSupabaseClient'

const SyncFormWrapper = () => {
  const {
    setNewField,
    setNewFields,
    asset,
    assetId,
    setIsSyncFormVisible,
    hydrate,
  } = useEditor()

  if (!asset) {
    return null
  }

  const urlToSync = asset.sourceurl

  const onChange = (newFields: Asset) => {
    console.debug(`AssetEditorWithSync.onChange`, { newFields })
    setNewFields(newFields)
  }

  const onDone = () => {
    console.debug(`AssetEditorWithSync.onDone`)
    setNewFields(null)
    setIsSyncFormVisible(false)
    hydrate()
  }

  return (
    <ExperimentalArea>
      <SyncForm<Asset>
        collectionName={CollectionNames.Assets}
        parentId={asset.id}
        urlToSync={urlToSync}
        onChange={onChange}
        onDone={onDone}
      />
    </ExperimentalArea>
  )
}

const AssetEditorWithSync = ({ assetId }: { assetId: string }) => {
  const [, , user] = useUserRecord()
  const [isError, setIsError] = useState(false)
  const [isHydrating, setIsHydrating] = useState(false)
  const [assetRecord, setAssetRecord] = useState<FullAsset | null>(null)
  const [newFields, setNewFields] = useState<Asset | null>(null)
  const [isSyncFormVisible, setIsSyncFormVisible] = useState(false)
  const supabase = useSupabaseClient()

  const hydrate = async () => {
    console.debug(`AssetEditorWithSync.hydrate`, { assetId })

    if (!assetId) {
      return
    }

    setIsHydrating(true)
    setIsError(false)

    try {
      const rawAssetFields = await readRecord<FullAsset>(
        supabase,
        ViewNames.GetFullAssets,
        assetId
      )

      // TODO: fix up old assets that do not default stuff
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
    setNewFields((currentFields) => ({
      ...currentFields,
      [fieldName]: newValue,
    }))

  useEffect(() => {
    console.debug(`AssetEditorWithSync.useEffect`, { assetId })

    if (!assetId) {
      return
    }
    hydrate()
  }, [assetId])

  if (!assetId) {
    return <>You need an ID</>
  }

  if (!assetRecord) {
    return <LoadingIndicator message="Loading asset to edit..." />
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
        isEditingAllowed: !isSyncFormVisible,
      }}>
      <Heading variant="h1">
        {assetId
          ? `Edit ${
              assetRecord.title ? `"${assetRecord.title}"` : '(untitled)'
            }`
          : 'Create Asset'}
      </Heading>
      {isSyncFormVisible ? <SyncFormWrapper /> : null}
      <AssetEditor />
    </EditorContext.Provider>
  )
}

export default AssetEditorWithSync
