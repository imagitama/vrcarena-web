import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Checkbox from '@material-ui/core/Checkbox'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import FilterListIcon from '@material-ui/icons/FilterList'

import Button from '../button'
import { trackAction } from '../../analytics'
import { searchFilters } from '../../config'
import { AssetCategories } from '../../hooks/useDatabaseQuery'
import {
  removeSearchFilter,
  addSearchFilter,
  clearSearchFilters
} from '../../modules/app'
import categoryMeta from '../../category-meta'

const analyticsCategoryName = 'SearchResults'

const useStyles = makeStyles({
  availableFilters: {
    marginTop: '0.5rem',
    display: 'flex',
    flexWrap: 'wrap'
  },
  availableFilter: {
    margin: '0 0.5rem 0.5rem 0'
  }
})

const availableFilters = [
  ...Object.values(AssetCategories).map(categoryName => ({
    id: `category:${categoryName}`,
    label: `Category - ${categoryMeta[categoryName].name}`
  })),
  {
    id: 'field:tags',
    label: 'Search tags only'
  }
]

const AvailableFilters = ({ hideFilters }) => {
  const { searchFilters } = useSelector(({ app: { searchFilters } }) => ({
    searchFilters
  }))
  const dispatch = useDispatch()
  const addFilter = id => dispatch(addSearchFilter(id))
  const removeFilter = id => dispatch(removeSearchFilter(id))
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
              hideFilters()
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
          hideFilters()
        }}
        size="small"
        className={classes.availableFilter}
        icon={<CloseIcon />}>
        Clear All
      </Button>
    </div>
  )
}

export default () => {
  const classes = useStyles()
  const [areFiltersVisible, setAreFiltersVisible] = useState(false)
  const { searchFilters } = useSelector(({ app: { searchFilters } }) => ({
    searchFilters
  }))

  return (
    <div className={classes.root}>
      <Button
        icon={<FilterListIcon />}
        onClick={() => {
          setAreFiltersVisible(currentVal => !currentVal)
          trackAction(analyticsCategoryName, 'Click toggle filters button')
        }}>
        Filters{searchFilters.length ? ` (${searchFilters.length})` : ''}
      </Button>
      {areFiltersVisible ? (
        <>
          <AvailableFilters hideFilters={() => setAreFiltersVisible(false)} />
        </>
      ) : null}
    </div>
  )
}
