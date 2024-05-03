import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'

import Button from '../button'
import { trackAction } from '../../analytics'
import { AssetCategories } from '../../hooks/useDatabaseQuery'
import {
  removeSearchFilter,
  addSearchFilter,
  clearSearchFilters,
} from '../../modules/app'
import categoryMeta from '../../category-meta'

const analyticsCategoryName = 'SearchResults'

const useStyles = makeStyles({
  availableFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
  },
  availableFilter: {
    margin: '0 0.5rem 0.5rem 0',
  },
})

const availableFilters = [
  ...Object.values(AssetCategories).map((categoryName) => ({
    id: `category:${categoryName}`,
    label: categoryMeta[categoryName].name,
  })),
  {
    id: 'field:tags',
    label: 'Search tags only',
  },
]

const SearchFilters = () => {
  const { searchFilters } = useSelector(({ app: { searchFilters } }) => ({
    searchFilters,
  }))
  const dispatch = useDispatch()
  const addFilter = (id) => dispatch(addSearchFilter(id))
  const removeFilter = (id) => dispatch(removeSearchFilter(id))
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
            icon={isSelected ? <CheckIcon /> : null}
            color="default">
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
        icon={<CloseIcon />}>
        Clear All
      </Button>
    </div>
  )
}

export default SearchFilters
