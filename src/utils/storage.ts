import { writeStorage } from '@rehooks/local-storage'

type JsonStringifyable = any

export const write = (key: string, val: JsonStringifyable): void => {
  writeStorage(key, val)
}
