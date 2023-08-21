import { useDispatch, useSelector } from 'react-redux'
import { toggleBulkEditId as toggleBulkEditIdAction } from '../modules/app'
import { RootState } from '../store'

const useBulkEdit = (): [null | string[], (id: string) => void] => {
  const bulkEditIds = useSelector<RootState, null | string[]>(
    state => state.app.bulkEditIds
  )
  const dispatch = useDispatch()

  const toggleBulkEditId = (id: string) => {
    console.debug(`Toggle bulk edit ID "${id}"`)
    dispatch(toggleBulkEditIdAction(id))
  }

  return [bulkEditIds, toggleBulkEditId]
}

export default useBulkEdit
