import { createContext, useContext } from 'react'
import { SyncResult } from '../../../syncing'

export interface SyncContextValue<TData extends object> {
  parentId: string
  lastResult: SyncResult
  fields: TData
  setField: (name: string, value: any) => void
  disabledFieldNames: string[]
  toggleField: (name: string) => void
}

// @ts-ignore
export const SyncContext = createContext<SyncContextValue<any>>()
export const useSync = <TRecord extends object>(): SyncContextValue<TRecord> =>
  useContext(SyncContext)

export default useSync
