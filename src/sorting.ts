import { OrderDirections } from './hooks/useDatabaseQuery'
import { Asset } from './modules/assets'

export const assetSortFields: { [key: string]: keyof Asset } = {
  createdat: 'createdat',
  title: 'title',
}

export const assetOptions: {
  [key: string]: { fieldName: keyof Asset; direction: OrderDirections }
} = {
  'title asc': {
    fieldName: assetSortFields.title,
    direction: OrderDirections.ASC,
  },
  'title desc': {
    fieldName: assetSortFields.title,
    direction: OrderDirections.DESC,
  },
  'date asc': {
    fieldName: assetSortFields.createdAt,
    direction: OrderDirections.ASC,
  },
  'date desc': {
    fieldName: assetSortFields.createdAt,
    direction: OrderDirections.DESC,
  },
}

// TODO: Do something way more efficient
export function getLabelForAssetSortFieldNameAndDirection(
  fieldName: string,
  direction: OrderDirections
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
