import { TaxonomyItem } from '../taxonomy'

export const getAllChildrenIds = (item: TaxonomyItem): string[] => {
  let childrenIdsToReturn: string[] = []

  if (item.children) {
    item.children.forEach(child => {
      childrenIdsToReturn.push(child.id)

      if (child.children) {
        const newIds = getAllChildrenIds(child)
        childrenIdsToReturn = childrenIdsToReturn.concat(newIds)
      }
    })
  }

  return childrenIdsToReturn
}

export const getAllParentsAndTheirChildrenIds = (
  item: TaxonomyItem,
  allItems: TaxonomyItem[]
): string[] => {
  let idsToReturn: string[] = []

  if (item.parent) {
    const parent = allItems.find(itemToCheck => itemToCheck.id === item.parent)

    if (parent) {
      const childrenIds = getAllChildrenIds(parent)
      idsToReturn = idsToReturn.concat(childrenIds)
    }
  }

  return idsToReturn
}

export function findAncestorsForId(
  array: TaxonomyItem[],
  id: string
): TaxonomyItem[] {
  for (let item of array) {
    if (item.id === id) {
      return [item]
    }
    if (item.children) {
      let result = findAncestorsForId(item.children, id)
      if (result.length) {
        result.unshift(item)
        return result
      }
    }
  }
  return []
}

export const getParentForItem = (
  itemToGetParentFor: TaxonomyItem,
  itemsToSearch: TaxonomyItem[]
): TaxonomyItem | null => {
  const parents = findAncestorsForId(itemsToSearch, itemToGetParentFor.id)

  if (!parents.length) {
    return null
  }

  const closestParent = parents[parents.length - 1]

  return closestParent
}

export const getSiblings = (
  itemToFind: TaxonomyItem,
  allItems: TaxonomyItem[]
): TaxonomyItem[] => {
  const siblings = allItems.filter(
    item =>
      item.id !== itemToFind.id &&
      item.parent &&
      item.parent === itemToFind.parent
  )
  return siblings
}

export const getIdsForAllParentsThatCanBeSelected = (
  selectedIds: string[],
  item: TaxonomyItem,
  allItems: TaxonomyItem[]
): string[] => {
  // go up the tree and find any parents we can force selected because ALL of their children are already selected

  let itemIdsToSelect: string[] = []

  const parent = getParentForItem(item, allItems)

  if (parent) {
    console.debug(`${item.id} has parent ${item.parent}`)

    if (parent.children) {
      console.debug(`${item.id} parent ${item.parent} has children`)

      const childrenIdsForParent = getAllChildrenIds(parent)
      const selectedChildrenIdsForParent = selectedIds.filter(id =>
        childrenIdsForParent.includes(id)
      )

      if (
        selectedChildrenIdsForParent.concat(item.id).length >=
        parent.children.length
      ) {
        itemIdsToSelect = itemIdsToSelect
          .concat([parent.id])
          .concat(childrenIdsForParent)
      }
    }

    const parentSiblings = getSiblings(parent, allItems)

    console.debug({
      siblingCount: parentSiblings.length,
      siblings: parentSiblings,
      selectedIds: selectedIds
    })

    if (
      !parentSiblings.length ||
      parentSiblings.every(parentSibling =>
        selectedIds.includes(parentSibling.id)
      )
    ) {
      console.debug(
        `${item.id} parent ${
          item.parent
        } has no siblings or all of their siblings are selected`
      )

      itemIdsToSelect = itemIdsToSelect.concat([parent.id])

      if (parent.parent) {
        console.debug(
          `${item.id} parent ${item.parent} also has parent ${parent.parent}`
        )

        itemIdsToSelect = itemIdsToSelect.concat(
          getIdsForAllParentsThatCanBeSelected(
            selectedIds.concat(itemIdsToSelect),
            parent,
            allItems
          )
        )
      }
    }
  } else {
    console.debug(`${item.id} does NOT have a parent`)
  }

  return itemIdsToSelect
}

export const reduceToPopularItems = (
  popularIds: string[],
  finalList: TaxonomyItem[],
  item: TaxonomyItem
): TaxonomyItem[] => {
  let newList = [...finalList]

  if (popularIds.includes(item.id)) {
    newList = newList.concat([item])
  }

  const childIds = item.children.reduce(
    (finalList: TaxonomyItem[], item: TaxonomyItem) =>
      reduceToPopularItems(popularIds, finalList, item),
    []
  )

  return newList.concat(childIds)
}

export const getAllParentIdsForItem = (
  item: TaxonomyItem,
  allItems: TaxonomyItem[]
): string[] => {
  const matches = findAncestorsForId(allItems, item.id)

  if (matches) {
    return matches.map(parent => parent.id)
  }

  return []
}
