import { writeStorage } from '@rehooks/local-storage'

export const write = (key, val) => {
  writeStorage(key, val)
}
