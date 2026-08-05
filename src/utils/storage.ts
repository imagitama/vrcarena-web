import { writeStorage } from '@rehooks/local-storage'

type JsonStringifyable = any

export const write = (key: string, val: JsonStringifyable): void => {
  writeStorage(key, val)
}

export const read = <T>(key: string): T | null => {
  const val = localStorage.getItem(key)
  return val ? JSON.parse(val) : null
}
