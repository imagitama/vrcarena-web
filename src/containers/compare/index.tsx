import React, { useState } from 'react'
import { useParams } from 'react-router'
import MultiDiff from '../../components/multi-diff'
import type { Asset } from '../../modules/assets'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import * as routes from '../../routes'

// fields
import assetsFields from './assets'
import useQueryParam from '../../hooks/useQueryParam'
import { addOrUpdateQueryParam } from '../../utils'
import useStorage from '../../hooks/useStorage'

const queryParamNameWith = 'with'

const Compare = () => {
  const { assetId: mainAssetId } = useParams<{
    assetId: string
  }>()
  const [storedOtherAssetIds, setStoredOtherAssetIds] =
    useStorage<string>('with')
  const rawOtherAssetIds = useQueryParam(queryParamNameWith)

  if (!mainAssetId) {
    throw new Error('You need an asset ID')
  }

  const initialOtherAssetIds = rawOtherAssetIds
    ? rawOtherAssetIds.split(',')
    : storedOtherAssetIds
    ? storedOtherAssetIds.split(',')
    : []
  const initialAllAssetIds = [mainAssetId, ...initialOtherAssetIds]

  const [allAssetIds, setAllAssetIds] = useState(initialAllAssetIds)
  const [otherAssetIds, setOtherAssetIds] = useState(initialOtherAssetIds)

  const [isLoading, isError, assets] = useDataStoreItems<Asset>(
    'getfullassets',
    allAssetIds.length ? allAssetIds : false,
    {
      quietHydrate: true,
    }
  )

  if (!allAssetIds.length) {
    return <>Waiting for IDs</>
  }

  if (isLoading || assets === null) {
    return <LoadingIndicator message="Loading assets to compare..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load assets to compare</ErrorMessage>
  }

  const storeOtherIds = (ids: string[]) => {
    const valueToStore = ids.join(',')
    addOrUpdateQueryParam(queryParamNameWith, valueToStore)
    setStoredOtherAssetIds(valueToStore)
  }

  const moveIdLeft = (id: string) => {
    setOtherAssetIds((currentIds) => {
      const index = currentIds.indexOf(id)
      if (index <= 0) return currentIds

      const newIds = [...currentIds]
      ;[newIds[index], newIds[index - 1]] = [newIds[index - 1], newIds[index]]

      storeOtherIds(newIds)

      return newIds
    })
  }

  const moveIdRight = (id: string) => {
    setOtherAssetIds((currentIds) => {
      const index = currentIds.indexOf(id)
      if (index === -1 || index === currentIds.length - 1) return currentIds

      const newIds = [...currentIds]
      ;[newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]]

      storeOtherIds(newIds)

      return newIds
    })
  }

  const mainItem = assets.find((asset) => asset.id === mainAssetId)!!
  const otherItems = otherAssetIds.map(
    (id) =>
      assets.find((asset) => asset.id === id) ||
      ({
        id,
      } as Asset)
  )

  const onAddId = (newId: string) => {
    console.debug(`Compare.onAddId`, { newId })
    setAllAssetIds((currentIds) => currentIds.concat([newId]))
    setOtherAssetIds((currentIds) => {
      const newIds = currentIds.concat([newId])

      storeOtherIds(newIds)

      return newIds
    })
  }

  const onRemoveId = (idToRemove: string) => {
    console.debug(`Compare.onRemoveId`, { idToRemove })
    setAllAssetIds((currentIds) => currentIds.filter((id) => id !== idToRemove))
    setOtherAssetIds((currentIds) => {
      const newIds = currentIds.filter((id) => id !== idToRemove)

      storeOtherIds(newIds)

      return newIds
    })
  }

  const replaceOtherIds = (newIds: string[]) => {
    console.debug(`Compare.replaceOtherIds`, { newIds })
    setAllAssetIds([mainItem.id].concat(newIds))
    setOtherAssetIds(newIds)
  }

  return (
    <MultiDiff<Asset>
      titleField="title"
      getUrl={(item) => routes.viewAssetWithVar.replace(':assetId', item.id)}
      fields={assetsFields}
      mainItem={mainItem}
      otherItems={otherItems}
      moveIdLeft={moveIdLeft}
      moveIdRight={moveIdRight}
      onRemoveId={onRemoveId}
      onAddId={onAddId}
      replaceOtherIds={replaceOtherIds}
    />
  )
}

export default Compare
