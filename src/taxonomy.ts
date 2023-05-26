import itemsJson from './taxonomy/items.json'
import popularItemsJson from './taxonomy/popular.json'
import { reduceToPopularItems } from './taxonomy/utils'
import { capitalize } from './utils'

export interface TaxonomyItem {
  id: string
  parent: string
  scientificName: string
  canonicalName: string
  otherNames?: string[]
  rank: string
  description: string
  thumbnailUrl: string
  metadata: any
  children: TaxonomyItem[]
}

interface ChatGptItem {
  type: string
  scientificName: string
  canonicalName: string
  children: ChatGptItem[]
  otherNames?: string[]
}

interface ChatGptItemWithParent extends ChatGptItem {
  parent: string
  children: ChatGptItemWithParent[]
}

const getIdFromChatGptItem = (item: ChatGptItem): string =>
  `${item.type}_${item.scientificName
    .toLowerCase()
    .replace(/[^a-zA-Z]/g, '')
    .replace(/ /g, '_')}`

const addParentPropertyToAllChildren = (
  items: ChatGptItem[],
  parentId: string
): ChatGptItemWithParent[] => {
  const newItems: ChatGptItemWithParent[] = []

  for (const item of items) {
    const newItem: ChatGptItemWithParent = {
      ...item,
      parent: parentId,
      children: item.children.map(child => ({
        ...child,
        parent: parentId,
        children: addParentPropertyToAllChildren(
          child.children,
          getIdFromChatGptItem(child)
        )
      }))
    }

    newItems.push(newItem)
  }

  return newItems
}

const rawItems = itemsJson as ChatGptItem[]

const itemsWithParentProps = addParentPropertyToAllChildren(rawItems, '')

const mapChatGptItemWithParentToTaxonomyItem = (
  item: ChatGptItemWithParent
): TaxonomyItem => ({
  id: getIdFromChatGptItem(item),
  parent: item.parent,
  scientificName: item.scientificName,
  canonicalName: item.canonicalName,
  otherNames: item.otherNames,
  children: item.children.map(mapChatGptItemWithParentToTaxonomyItem),
  rank: item.type,
  description: '',
  thumbnailUrl: '',
  metadata: {}
})

export const items: TaxonomyItem[] = itemsWithParentProps.map(
  mapChatGptItemWithParentToTaxonomyItem
)

export interface PopularItemInfo {
  type: string
  scientificName: string
  canonicalName: string
  children: ChatGptItem[]
}

const popularItemInfos = popularItemsJson as PopularItemInfo[]

export const popularIds = popularItemInfos.map(getIdFromChatGptItem)

export const getRankById = (rankId: string): TaxonomyItem | null => {
  console.debug(`getRankById`, rankId)
  return searchItemsForId(items, rankId)
}

export const searchItemsForId = (
  items: TaxonomyItem[],
  id: string
): TaxonomyItem | null => {
  for (const item of items) {
    if (item.id === id) {
      return item
    }

    const childResult = searchItemsForId(item.children, id)

    if (childResult) {
      return childResult
    }
  }

  return null
}

const popularItemsToUse = items
  .reduce<TaxonomyItem[]>(
    (finalList: TaxonomyItem[], item: TaxonomyItem) =>
      reduceToPopularItems(popularIds, finalList, item),
    []
  )
  .sort((itemA, itemB) =>
    itemA.canonicalName.localeCompare(itemB.canonicalName)
  )

export const itemsWithPopularOnes: TaxonomyItem[] = [
  {
    id: 'special_popular_items',
    parent: '',
    rank: 'special',
    scientificName: 'Popular Items',
    canonicalName: 'Popular Items',
    description: '',
    thumbnailUrl: '',
    metadata: {},
    children: popularItemsToUse
  }
].concat(items)

export interface TaxonomyItemWithLabel extends TaxonomyItem {
  label: string
}

function flattenItems(
  items: TaxonomyItem[],
  getLabel: (item: TaxonomyItem) => string,
  parentLabels: string[] = []
): TaxonomyItemWithLabel[] {
  const flatArray = []

  for (const item of items) {
    const { scientificName, canonicalName, children } = item
    const fullLabel = [...parentLabels, getLabel(item)].join(' - ')

    flatArray.push({ ...item, label: fullLabel })

    if (Array.isArray(children)) {
      flatArray.push(
        ...flattenItems(children, getLabel, [
          ...parentLabels,
          canonicalName || scientificName
        ])
      )
    }
  }

  return flatArray
}

export const getLabelForRank = (rank: string) =>
  capitalize(rank).replaceAll('_', ' ')

export const getFlattenedItems = (
  getLabel: (item: TaxonomyItem) => string,
  includePopular?: boolean
): TaxonomyItemWithLabel[] =>
  flattenItems(items.concat(includePopular ? popularItemsToUse : []), getLabel)
