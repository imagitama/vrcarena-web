import React, { useEffect, useRef, useState } from 'react'
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon'
import SearchIcon from '@material-ui/icons/Search'
import {
  alpha,
  makeStyles,
  withStyles,
  Theme,
  createStyles
} from '@material-ui/core/styles'
import TreeView from '@material-ui/lab/TreeView'
import TreeItem, { TreeItemProps } from '@material-ui/lab/TreeItem'
import Collapse from '@material-ui/core/Collapse'
// import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support
import { TransitionProps } from '@material-ui/core/transitions'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import {
  getFlattenedItems,
  getLabelForRank,
  TaxonomyItem,
  TaxonomyItemWithLabel
} from '../../taxonomy'
import { getAllParentIdsForItem } from '../../taxonomy/utils'
import * as routes from '../../routes'
import Link from '../link'
import { capitalize } from '../../utils'
import AutocompleteInput, { AutocompleteOption } from '../autocomplete-input'
import Button from '../button'

function MinusSquare(props: SvgIconProps) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  )
}

function PlusSquare(props: SvgIconProps) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  )
}

function CloseSquare(props: SvgIconProps) {
  return (
    <SvgIcon
      className="close"
      fontSize="inherit"
      style={{ width: 14, height: 14 }}
      {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  )
}

function TransitionComponent(props: TransitionProps) {
  //   const style = useSpring({
  //     from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
  //     to: { opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)` },
  //   });

  return (
    <div style={{}}>
      <Collapse {...props} />
    </div>
  )
}

const StyledTreeItem = withStyles((theme: Theme) =>
  createStyles({
    iconContainer: {
      '& .close': {
        opacity: 0.3
      }
    },
    group: {
      marginLeft: 7,
      paddingLeft: 18,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`
    },
    label: {
      fontWeight: 'bold'
    }
  })
)(
  ({
    item,
    isHighlighted,
    ...props
  }: TreeItemProps & { item: TaxonomyItem; isHighlighted: boolean }) => {
    const classes = useStyles()

    return (
      <TreeItem
        {...props}
        label={
          <>
            {capitalize(item.rank)}: {item.canonicalName}{' '}
            <Link to={routes.viewRankWithVar.replace(':rankId', item.id)}>
              <OpenInNewIcon />
            </Link>
          </>
        }
        TransitionComponent={TransitionComponent}
        classes={isHighlighted ? { label: classes.highlighted } : undefined}>
        {props.children}
      </TreeItem>
    )
  }
)

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      //   height: 264,
      //   flexGrow: 1,
      //   maxWidth: 400
    },
    highlighted: {
      // @ts-ignore
      color: theme.palette.tertiary.main
    },
    search: {
      margin: '0 0 1rem 0',
      display: 'flex',
      alignItems: 'center',
      '& *:first-child': {
        width: '100%',
        paddingRight: '0.25rem'
      },
      '& *:nth-child(2)': {
        marginRight: '0.25rem'
      }
    }
  })
)

const RenderWithChildren = ({
  items,
  highlightedIds
}: {
  items: TaxonomyItem[]
  highlightedIds: string[]
}) => {
  return (
    <>
      {items.map(item => {
        const isHighlighted = highlightedIds.includes(item.id)
        return (
          <StyledTreeItem
            key={item.id}
            nodeId={item.id}
            item={item}
            isHighlighted={isHighlighted}
            collapseIcon={item.children.length ? undefined : false}>
            {item.children.length ? (
              <RenderWithChildren
                items={item.children}
                highlightedIds={highlightedIds}
              />
            ) : (
              undefined
            )}
          </StyledTreeItem>
        )
      })}
    </>
  )
}

export const formatSearchTermForFinding = (searchTerm: string): string =>
  searchTerm.trim().toLowerCase()

const filterTaxonomyItemBySearchTerm = (
  item: TaxonomyItem,
  searchTerm: string
): boolean =>
  (item.canonicalName
    ? formatSearchTermForFinding(item.canonicalName).includes(searchTerm)
    : false) ||
  (item.scientificName
    ? formatSearchTermForFinding(item.scientificName).includes(searchTerm)
    : false) ||
  (item.otherNames
    ? item.otherNames.some(otherName =>
        formatSearchTermForFinding(otherName).includes(searchTerm)
      )
    : false)

const recursivelySearchItems = (
  searchTerm: string,
  itemsToSearch: TaxonomyItem[]
): TaxonomyItem[] => {
  let matches: TaxonomyItem[] = []

  const searchTermForFinding = formatSearchTermForFinding(searchTerm)

  const newMatches = itemsToSearch.filter(item =>
    filterTaxonomyItemBySearchTerm(item, searchTermForFinding)
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
  items,
  expandedIds = [],
  highlightedIds = [],
  onExpandedChange,
  onHighlightedChange
}: {
  items: TaxonomyItem[]
  expandedIds: string[]
  highlightedIds?: string[]
  onExpandedChange: (newIds: string[]) => void
  onHighlightedChange?: (newIds: string[]) => void
}) => {
  const classes = useStyles()
  const flattenedItemsRef = useRef<AutocompleteOption<TaxonomyItemWithLabel>[]>(
    []
  )
  const [userInput, setUserInput] = useState('')

  useEffect(() => {
    flattenedItemsRef.current = getFlattenedItems(
      item =>
        `${item.canonicalName || item.scientificName} (${getLabelForRank(
          item.rank
        )})`,
      true
    ).map(item => ({
      label: item.label,
      data: item
    }))
  }, [])

  const onClear = () => {
    setUserInput('')
    if (onHighlightedChange) {
      onHighlightedChange([])
      onExpandedChange([])
    }
  }

  const performSearch = (searchTerm: string): void => {
    console.debug(`Searching for "${searchTerm}"...`)

    let newIdsToHighlight: string[] = []

    const matches = recursivelySearchItems(searchTerm, items)

    if (matches.length) {
      console.debug(`Found ${matches.length} matches:`, matches)

      newIdsToHighlight = newIdsToHighlight.concat(
        matches.map(match => match.id)
      )

      for (const match of matches) {
        const parentIds = getAllParentIdsForItem(match, items)

        newIdsToHighlight = newIdsToHighlight.concat(parentIds)
      }
    } else {
      console.debug(`Did not find a match :(`)
    }

    if (onHighlightedChange) {
      onHighlightedChange(newIdsToHighlight)
      onExpandedChange(newIdsToHighlight)
    }
  }

  return (
    <>
      {onHighlightedChange ? (
        <div className={classes.search}>
          <AutocompleteInput
            label="Search"
            options={flattenedItemsRef.current}
            filterOptions={(
              options: AutocompleteOption<TaxonomyItem>[],
              searchTerm: string
            ) =>
              options.filter(option =>
                filterTaxonomyItemBySearchTerm(
                  option.data,
                  formatSearchTermForFinding(searchTerm)
                )
              )
            }
            onClear={() => onClear()}
            // search only
            value={userInput}
            onNewValue={newValue => setUserInput(newValue)}
            onSelectedOption={newOption => performSearch(userInput)}
          />
          <div>
            <Button
              onClick={() => performSearch(userInput)}
              icon={<SearchIcon />}>
              Search
            </Button>
          </div>
          <div>
            <Button color="default" onClick={() => onClear()}>
              Clear
            </Button>
          </div>
        </div>
      ) : null}
      <TreeView
        className={classes.root}
        expanded={expandedIds.concat(highlightedIds)}
        onNodeToggle={(event, newSelectedNodeIds) => {
          onExpandedChange(newSelectedNodeIds)
        }}
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}>
        <RenderWithChildren items={items} highlightedIds={highlightedIds} />
      </TreeView>
    </>
  )
}
