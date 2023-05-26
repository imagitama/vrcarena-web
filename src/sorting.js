import { AssetFieldNames, OrderDirections } from './hooks/useDatabaseQuery'

export const assetSortFields = {
  [AssetFieldNames.createdAt]: AssetFieldNames.createdAt,
  [AssetFieldNames.title]: AssetFieldNames.title
}

export const assetOptions = {
  'title asc': {
    fieldName: assetSortFields.title,
    direction: OrderDirections.ASC
  },
  'title desc': {
    fieldName: assetSortFields.title,
    direction: OrderDirections.DESC
  },
  'date asc': {
    fieldName: assetSortFields.createdAt,
    direction: OrderDirections.ASC
  },
  'date desc': {
    fieldName: assetSortFields.createdAt,
    direction: OrderDirections.DESC
  }
}

// TODO: Do something way more efficient
export function getLabelForAssetSortFieldNameAndDirection(
  fieldName,
  direction
) {
  if (!fieldName && !direction) {
    return ''
  }

  for (const label in assetOptions) {
    const option = assetOptions[label]
    if (option.fieldName === fieldName && option.direction === direction) {
      return label
    }
  }
  throw new Error(
    `Cannot get label for asset sort field name "${fieldName}" and direction "${direction}"`
  )
}
