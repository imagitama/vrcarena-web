import { writeStorage } from '@rehooks/local-storage'

export const cartIdsStorageKey = 'cart'

export const clear = () => {
  writeStorage(cartIdsStorageKey, [])
}
