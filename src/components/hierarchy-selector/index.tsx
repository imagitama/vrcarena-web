import React, { createContext, useContext, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Tooltip from '@material-ui/core/Tooltip'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { TaxonomyItem, items as itemsToUse, popularIds } from '../../taxonomy'
import SearchInput from '../search-input'
import {
  getAllChildrenIds,
  getAllParentIdsForItem,
  getAllParentsAndTheirChildrenIds,
  getIdsForAllParentsThatCanBeSelected,
  getParentForItem,
  reduceToPopularItems
} from '../../taxonomy/utils'
import Heading from '../heading'

const useStyles = makeStyles({
  root: {
    '& *': {
      userSelect: 'none'
    },
    '& h3': {
      margin: '0.5rem 0'
    }
  },
  groups: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap'
  },
  group: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    margin: '0.5rem'
  },
  item: {
    minWidth: '25%',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  rootItem: {
    margin: '0 0.5rem 0.5rem 0',
    padding: '0.25rem 0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  button: {
    borderRadius: '3px',
    margin: '0.25rem',
    backgroundColor: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(0,0,0,0.1)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 100ms',
    '&:hover': {
      backgroundColor: 'rgb(50, 50, 50)'
    }
  },
  label: {
    width: '100%',
    padding: '0.25rem 0.5rem 0.25rem 0.25rem'
  },
  selected: {
    backgroundColor: 'rgb(125, 125, 125)',
    '&:hover': {
      backgroundColor: 'rgb(175, 175, 175)'
    }
  },
  unselected: {},
  children: {},
  itemLabel: {
    padding: '1rem 0 0 1rem',
    fontSize: '125%'
  },
  popular: {
    fontWeight: 'bold'
  },
  toggleSelector: {
    height: '100%',
    display: 'flex',
    alignItems: 'center'
  },
  expander: {
    transition: 'all 100ms',
    height: '100%',
    display: 'flex',
    alignItems: 'center'
  },
  expanded: {
    transform: 'rotate(180deg)'
  },
  highlighted: {
    outline: '1px solid yellow'
  },
  search: {
    marginBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'right'
  }
})

// function convertItemsIntoNestedItems(
//   arrayOfItems: TaxonomyItem[],
//   parentId: string
// ): TaxonomyItem[] {
//   const result = []
//   console.debug(arrayOfItems)
//   for (const item of arrayOfItems) {
//     if (item.parent === parentId) {
//       const children = convertItemsIntoNestedItems(arrayOfItems, item.id)
//       if (children.length) {
//         item.children = children
//       }
//       result.push(item)
//     }
//   }
//   return result
// }

// console.debug(`Items to use`, itemsToUse)

const getIsItemPopular = (item: TaxonomyItem): boolean =>
  popularIds.includes(item.id)

const ItemOutput = ({
  item,
  level,
  showChildren = true
}: {
  item: TaxonomyItem
  level: number | null
  showChildren?: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState(
    item.children.length === 1 && item.children[0].children.length === 0
  )
  const classes = useStyles()
  const { selectedIds, toggleItem, highlightedIds } = useHierarchySelector()

  const isHighlighted = highlightedIds.includes(item.id)
  const isActuallyExpanded = isExpanded || isHighlighted
  const isSelected = selectedIds.includes(item.id)

  const toggleExpanded = () => setIsExpanded(currentVal => !currentVal)

  return (
    <div className={`${classes.item} ${level === 0 ? classes.rootItem : ''}`}>
      <Tooltip
        arrow
        title={`${item.description || item.scientificName} (${item.rank})`}>
        <div
          className={`${classes.button} ${
            isSelected ? classes.selected : classes.unselected
          }
              ${getIsItemPopular(item) ? classes.popular : ''} ${
            isHighlighted ? classes.highlighted : ''
          }`}>
          <div
            className={classes.toggleSelector}
            onClick={() => toggleItem(item)}>
            {isSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
          </div>
          <div className={classes.label} onClick={toggleExpanded}>
            {item.canonicalName}
          </div>
          {showChildren !== false && item.children.length ? (
            <div
              className={`${classes.expander} ${
                isActuallyExpanded ? classes.expanded : ''
              }`}
              onClick={toggleExpanded}>
              <KeyboardArrowDownIcon />
            </div>
          ) : null}
        </div>
      </Tooltip>
      {showChildren !== false && item.children.length && isActuallyExpanded ? (
        <div className={classes.children}>
          <Items items={item.children} level={level ? level + 1 : null} />
        </div>
      ) : null}
    </div>
  )
}

const Items = ({
  items,
  level,
  showChildren = true
}: {
  items: TaxonomyItem[]
  level: number | null
  showChildren?: boolean
}) => {
  const classes = useStyles()

  return (
    <div className={`${classes.group}`} style={{ marginLeft: `${level}rem` }}>
      {items.map(item => (
        <ItemOutput
          key={item.id}
          item={item}
          level={level}
          showChildren={showChildren}
        />
      ))}
    </div>
  )
}

const popularItemsToUse = itemsToUse
  .reduce<TaxonomyItem[]>(
    (finalList: TaxonomyItem[], item: TaxonomyItem) =>
      reduceToPopularItems(popularIds, finalList, item),
    []
  )
  .sort((itemA, itemB) =>
    itemA.canonicalName.localeCompare(itemB.canonicalName)
  )

const PopularItems = () => {
  const classes = useStyles()
  return (
    <div className={`${classes.item} ${classes.rootItem}`}>
      <Heading variant="h3">Popular Selections</Heading>
      <Items items={popularItemsToUse} level={null} showChildren={false} />
    </div>
  )
}

interface HierarchySelectorContextValue {
  selectedIds: string[]
  toggleItem: (item: TaxonomyItem) => void
  highlightedIds: string[]
}

const HierarchySelectorContext = createContext<HierarchySelectorContextValue>({
  selectedIds: [],
  toggleItem: () => {},
  highlightedIds: []
})
const useHierarchySelector = () => useContext(HierarchySelectorContext)

const formatSearchTermForFinding = (searchTerm: string): string =>
  searchTerm.trim().toLowerCase()

const recursivelySearchItems = (
  searchTerm: string,
  itemsToSearch: TaxonomyItem[]
): TaxonomyItem[] => {
  let matches: TaxonomyItem[] = []

  const searchTermForFinding = formatSearchTermForFinding(searchTerm)

  // console.debug(
  //   `recursivelySearchItems`,
  //   searchTerm,
  //   itemsToSearch.map(item => item.canonicalName)
  // )

  const newMatches = itemsToSearch.filter(
    item =>
      (item.canonicalName
        ? formatSearchTermForFinding(item.canonicalName).includes(
            searchTermForFinding
          )
        : false) ||
      (item.scientificName
        ? formatSearchTermForFinding(item.scientificName).includes(
            searchTermForFinding
          )
        : false)
  )

  matches = matches.concat(newMatches)

  for (const itemToSearch of itemsToSearch) {
    const childMatches = recursivelySearchItems(
      searchTerm,
      itemToSearch.children
    )
    matches = matches.concat(childMatches)
  }

  return matches
}

export default ({
  selectedIds,
  highlightedIds = [],
  onChange,
  onHighlightedChange
}: {
  selectedIds: string[]
  highlightedIds?: string[]
  onChange: (newIds: string[]) => void
  onHighlightedChange?: (newIds: string[]) => void
}) => {
  const classes = useStyles()

  const toggleItem = (item: TaxonomyItem) => {
    const needsToBeEnabled = !selectedIds.includes(item.id)

    // TODO: Consolidate into a single array
    let itemIdsToSelect: string[] = []
    let itemIdsToDeselect: string[] = []

    if (needsToBeEnabled) {
      itemIdsToSelect.push(item.id)

      if (item.children) {
        const childrenIdsToSelect = getAllChildrenIds(item)
        itemIdsToSelect = itemIdsToSelect.concat(childrenIdsToSelect)
      }

      itemIdsToSelect = itemIdsToSelect.concat(
        getIdsForAllParentsThatCanBeSelected(selectedIds, item, itemsToUse)
      )

      itemIdsToDeselect = itemIdsToDeselect.concat(
        getAllParentsAndTheirChildrenIds(item, itemsToUse)
      )
    } else {
      itemIdsToDeselect.push(item.id)

      if (item.children) {
        const childrenIdsToUnselect = getAllChildrenIds(item)
        itemIdsToDeselect = itemIdsToDeselect.concat(childrenIdsToUnselect)
      }

      const parent = getParentForItem(item, itemsToUse)

      if (parent && parent.children) {
        const childrenIdsForParent = getAllChildrenIds(parent)
        const selectedChildrenIdsForParent = selectedIds.filter(id =>
          childrenIdsForParent.includes(id)
        )

        if (
          selectedChildrenIdsForParent.filter(id => id !== item.id).length <
          parent.children.length
        ) {
          itemIdsToDeselect = itemIdsToDeselect.concat([parent.id])
        }
      }
    }

    const newIds = selectedIds
      // ensure deselecting happens first
      .filter(id => !itemIdsToDeselect.includes(id))
      .concat(itemIdsToSelect)

    const newIdsWithoutDupes = newIds.filter(
      (id, index) => newIds.indexOf(id) === index
    )

    onChange(newIdsWithoutDupes)
  }

  const performSearch = (searchTerm: string) => {
    console.debug(`Performing search with "${searchTerm}"`)

    // TODO: Fix some species not highlighting everything properly

    let newIdsToHighlight: string[] = []

    const matches = recursivelySearchItems(searchTerm, itemsToUse)

    if (matches.length) {
      console.debug(`Found ${matches.length} matches:`, matches)

      newIdsToHighlight = newIdsToHighlight.concat(
        matches.map(match => match.id)
      )

      for (const match of matches) {
        const parentIds = getAllParentIdsForItem(match, itemsToUse)

        newIdsToHighlight = newIdsToHighlight.concat(parentIds)
      }
    } else {
      console.debug(`Did not find a match :(`)
    }

    if (onHighlightedChange) {
      onHighlightedChange(newIdsToHighlight)
    }
  }

  return (
    <HierarchySelectorContext.Provider
      value={{
        selectedIds,
        toggleItem,
        highlightedIds
      }}>
      <div className={classes.root}>
        {onHighlightedChange ? (
          <div className={classes.search}>
            <SearchInput
              performSearch={performSearch}
              onClear={() => onHighlightedChange([])}
            />
          </div>
        ) : null}
        <div className={classes.groups}>
          <PopularItems />
        </div>
        <Heading variant="h3">Narrow Your Selection</Heading>
        <div className={classes.groups}>
          <Items items={itemsToUse} level={0} />
        </div>
      </div>
    </HierarchySelectorContext.Provider>
  )
}
