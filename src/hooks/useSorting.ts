import { OrderDirections } from './useDatabaseQuery'
import useStorage from './useStorage'

export interface SortingConfig {
  fieldName: string
  direction: string
}

export default (
  sortKey: string,
  defaultFieldName: string = '',
  defaultDirection: string = OrderDirections.DESC
): [SortingConfig | null, (newConfig: SortingConfig) => void] => {
  const [sorting, setSorting] = useStorage(`sorting_${sortKey}`, {
    fieldName: defaultFieldName,
    direction: defaultDirection
  })

  return [sorting, setSorting]
}
