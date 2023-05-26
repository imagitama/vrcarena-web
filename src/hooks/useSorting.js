import { OrderDirections } from './useDatabaseQuery'
import useStorage from './useStorage'

export default (
  sortKey,
  defaultFieldName = '',
  defaultDirection = OrderDirections.DESC
) => {
  const [sorting, setSorting] = useStorage(`sorting_${sortKey}`, {
    fieldName: defaultFieldName,
    direction: defaultDirection
  })

  return [sorting, setSorting]
}
