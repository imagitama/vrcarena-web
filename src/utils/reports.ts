import {
  CollectionNames as ReviewsCollectionNames,
  ViewNames as ReviewsViewNames,
} from '../modules/reviews'

export const getViewNameForParentTable = (
  parentTable: string
): string | undefined => {
  switch (parentTable) {
    case ReviewsCollectionNames.Reviews:
      return ReviewsViewNames.GetFullReviews
    default:
      return undefined
  }
}
