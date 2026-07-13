import React from 'react'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { makeStyles } from '@mui/styles'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

import { trackAction } from '@/analytics'
import {
  removeSearchFilter,
  addSearchFilter,
  clearSearchFilters,
} from '@/modules/app'
import categoryMeta from '@/category-meta'
import { AssetCategory } from '@/modules/assets'
import { RootState } from '@/modules'

import Button from '@/components/button'
import store from '@/store'

const analyticsCategoryName = 'SearchResults'

const useStyles = makeStyles({
  availableFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
  },
  availableFilter: {
    '&&': {
      margin: '0 0.1rem 0 0',
    },
  },
})

const availableFilters = [
  ...Object.values(AssetCategory).map((categoryName) => ({
    id: `category:${categoryName}`,
    label: categoryMeta[categoryName].name,
  })),
  {
    id: 'field:tags',
    label: 'Search tags only',
  },
]

interface SearchFilter {}

const SearchFilters = () => {
  const { searchFilters } = useSelector<
    RootState,
    { searchFilters: SearchFilter[] }
  >(
    ({ app: { searchFilters } }) => ({
      searchFilters,
    }),
    shallowEqual
  )
  const dispatch = useDispatch<typeof store.dispatch>()
  const addFilter = (id: string) => dispatch(addSearchFilter(id))
  const removeFilter = (id: string) => dispatch(removeSearchFilter(id))
  const clearAllFilters = () => dispatch(clearSearchFilters())
  const classes = useStyles()

  return (
    <div className={classes.availableFilters}>
      {availableFilters.map(({ id, label }) => {
        const isSelected = searchFilters.includes(id)
        return (
          <Button
            key={id}
            size="small"
            onClick={() => {
              trackAction(
                analyticsCategoryName,
                'Click apply search filter button',
                id
              )
              if (isSelected) {
                removeFilter(id)
              } else {
                addFilter(id)
              }
            }}
            className={classes.availableFilter}
            icon={isSelected ? <CheckIcon /> : undefined}
            color="secondary">
            {label}
          </Button>
        )
      })}
      <Button
        onClick={() => {
          clearAllFilters()
          trackAction(
            analyticsCategoryName,
            'Click clear all search filters button'
          )
        }}
        size="small"
        className={classes.availableFilter}
        icon={<CloseIcon />}
        color="secondary"
        hollow={false}>
        Clear All
      </Button>
    </div>
  )
}

export default SearchFilters
