import { OrderDirections } from './useDatabaseQuery'
import useStorage from './useStorage'

export interface SortingConfig {
  fieldName: string
  direction: OrderDirections
}

export default (
  sortKey: string,
  defaultFieldName: string = '',
  defaultDirection: OrderDirections = OrderDirections.DESC
): [SortingConfig | null, (newConfig: SortingConfig) => void] => {
  const [sorting, setSorting] = useStorage<SortingConfig>(
    `sorting_${sortKey}`,
    {
      fieldName: defaultFieldName,
      direction: defaultDirection,
    }
  )

  return [sorting, setSorting]
}
