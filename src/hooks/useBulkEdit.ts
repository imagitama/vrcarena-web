import { useDispatch, useSelector } from 'react-redux'
import {
  toggleBulkEditId as toggleBulkEditIdAction,
  selectBulkEditId as selectBulkEditIdAction,
  setSelectingAll as setSelectingAllAction
} from '../modules/app'
import { Asset } from '../modules/assets'
import { RootState } from '../store'

const useBulkEdit = (): {
  ids: null | string[]
  assetDatas: Asset[]
  toggleId: (id: string) => void
  toggleAsset: (asset: Asset) => void
  selectId: (id: string) => void
  selectAsset: (asset: Asset) => void
  isSelectingAll: boolean
  setSelectingAll: (newValue: boolean) => void
} => {
  const ids = useSelector<RootState, null | string[]>(
    state => state.app.bulkEditIds
  )
  const isSelectingAll = useSelector<RootState, boolean>(
    state => state.app.isSelectingAll
  )
  const assetDatas = useSelector<RootState, Asset[]>(
    state => state.app.bulkEditAssetDatas
  )
  const dispatch = useDispatch()

  const toggleId = (id: string) => {
    console.debug(`Toggle bulk edit ID "${id}"`)
    dispatch(toggleBulkEditIdAction(id))
  }

  const toggleAsset = (asset: Asset) => {
    console.debug(`Toggle bulk edit asset "${asset.id}"`)
    dispatch(toggleBulkEditIdAction(asset.id, asset))
  }

  const selectId = (id: string) => {
    console.debug(`Select bulk edit ID "${id}"`)
    dispatch(selectBulkEditIdAction(id))
  }

  const selectAsset = (asset: Asset) => {
    console.debug(`Select bulk edit asset "${asset.id}"`)
    dispatch(selectBulkEditIdAction(asset.id, asset))
  }

  const setSelectingAll = (newValue: boolean) => {
    dispatch(setSelectingAllAction(newValue))
  }

  return {
    ids,
    assetDatas,
    toggleId,
    toggleAsset,
    selectId,
    selectAsset,
    isSelectingAll,
    setSelectingAll
  }
}

export default useBulkEdit
