import { OrderDirections } from './useDatabaseQuery'
import useStorage from './useStorage'

export interface SortingConfig {
  fieldName: string
  direction: OrderDirections
}

export interface RawSortingConfig {
  fieldName: string
  direction: keyof typeof OrderDirections
}

const useSorting = (
  sortKey: string,
  defaultFieldName: string = '',
  defaultDirection: OrderDirections = OrderDirections.DESC
): [SortingConfig | null, (newConfig: SortingConfig) => void] => {
  const [rawSortingConfig, storeRawSortingConfig] =
    useStorage<RawSortingConfig>(`sorting_${sortKey}`, {
      fieldName: defaultFieldName,
      direction: OrderDirections[
        defaultDirection
      ] as keyof typeof OrderDirections,
    })

  const storeSortingConfig = (newSortingConfig: SortingConfig) => {
    const newRawSortingConfig = {
      fieldName: newSortingConfig.fieldName,
      direction: OrderDirections[
        newSortingConfig.direction
      ] as keyof typeof OrderDirections,
    }

    console.debug(`useSorting.set`, {
      provided: newSortingConfig,
      stored: newRawSortingConfig,
    })

    storeRawSortingConfig(newRawSortingConfig)
  }

  const sortingConfig =
    rawSortingConfig !== null
      ? {
          fieldName: rawSortingConfig.fieldName,
          direction: OrderDirections[rawSortingConfig.direction],
        }
      : null

  console.debug('useSorting.render', { rawSortingConfig, sortingConfig })

  return [sortingConfig, storeSortingConfig]
}

export default useSorting
