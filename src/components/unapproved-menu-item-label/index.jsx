import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'

export default () => {
  let [, , results] = useDatabaseQuery(CollectionNames.Assets, [
    [AssetFieldNames.isApproved, Operators.EQUALS, false]
  ])
  results = results
    ? results.filter(({ isDeleted }) => isDeleted !== true)
    : null

  return `Unapproved (${results ? results.length : '-'})`
}
