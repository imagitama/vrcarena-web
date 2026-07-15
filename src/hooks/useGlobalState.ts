import { DataStoreErrorCode } from '@/data-store'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/modules'
import {
  GlobalState,
  GlobalStateSlice,
  hydrateGlobalState,
} from '@/slices/globalState'
import store from '@/store'
import { useEffect } from 'react'
import useSupabaseClient from './useSupabaseClient'

type HydrateFn = () => void

let isInitiallyHydrating = false

const useGlobalState = (): [
  boolean,
  DataStoreErrorCode | null,
  GlobalState | null,
  HydrateFn
] => {
  const {
    isLoading,
    errorCode: lastErrorCode,
    globalState,
  } = useSelector<RootState, GlobalStateSlice>(
    ({ globalState }) => ({
      isLoading: globalState.isLoading,
      errorCode: globalState.errorCode,
      globalState: globalState.globalState,
    }),
    shallowEqual
  )

  // console.debug(`useGlobalState`, { isLoading, lastErrorCode, globalState })

  const dispatch = useDispatch<typeof store.dispatch>()
  const client = useSupabaseClient()
  const hydrate = () => dispatch(hydrateGlobalState(client))

  useEffect(() => {
    if (!isInitiallyHydrating) {
      isInitiallyHydrating = true
      // console.debug(`useGlobalState.hydrate`)
      hydrate()
    }
  }, [])

  return [isLoading, lastErrorCode, globalState, hydrate]
}

export default useGlobalState
