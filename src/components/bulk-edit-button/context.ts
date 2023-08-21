import { createContext, useContext } from 'react'
import { FullAsset } from '../../modules/assets'

interface Context {
  ids: null | string[]
  assets: FullAsset[]
  userInput: string
  setUserInput: (newUserInput: string) => void
}

// @ts-ignore
export const context = createContext<Context>()

export const useBulkEdit = () => useContext(context)
