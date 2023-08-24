import { useDispatch, useSelector } from 'react-redux'
import {
  toggleBulkEditId as toggleBulkEditIdAction,
  selectBulkEditId as selectBulkEditIdAction,
  setSelectingAll as setSelectingAllAction
} from '../modules/app'
import { RootState } from '../store'

const useBulkEdit = (): {
  ids: null | string[]
  toggleId: (id: string) => void
  selectId: (id: string) => void
  isSelectingAll: boolean
  setSelectingAll: (newValue: boolean) => void
} => {
  const ids = useSelector<RootState, null | string[]>(
    state => state.app.bulkEditIds
  )
  const isSelectingAll = useSelector<RootState, boolean>(
    state => state.app.isSelectingAll
  )
  const dispatch = useDispatch()

  const toggleId = (id: string) => {
    console.debug(`Toggle bulk edit ID "${id}"`)
    dispatch(toggleBulkEditIdAction(id))
  }

  const selectId = (id: string) => {
    console.debug(`Select bulk edit ID "${id}"`)
    dispatch(selectBulkEditIdAction(id))
  }

  const setSelectingAll = (newValue: boolean) => {
    dispatch(setSelectingAllAction(newValue))
  }

  return {
    ids,
    toggleId,
    selectId,
    isSelectingAll,
    setSelectingAll
  }
}

export default useBulkEdit
