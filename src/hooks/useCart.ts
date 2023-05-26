import { cartIdsStorageKey } from '../cart'
import useStorage from './useStorage'

export default () => {
  const [ids, setIds] = useStorage<string[]>(cartIdsStorageKey, [])

  const add = (id: string) => setIds(ids ? ids.concat([id]) : [id])

  const remove = (id: string) =>
    setIds(ids ? ids.filter(idToCheck => idToCheck !== id) : [])

  const clear = () => setIds([])

  return {
    ids: ids || [],
    add,
    remove,
    clear
  }
}
