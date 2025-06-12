import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

import useFilters from '../../hooks/useFilters'
import Button from '../button'
import TextInput from '../text-input'
import Select, { MenuItem } from '../select'
import useUserId from '../../hooks/useUserId'
import ButtonDropdown from '../button-dropdown'
import {
  ActiveFilter,
  EqualFilter,
  Filter,
  FilterSubType,
  FilterType,
  MultichoiceFilter,
} from '../../filters'
import { Filter as FilterIcon } from '../../icons'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  filter: {
    padding: '0.25rem',
    display: 'flex',
  },
})

const UserIdInput = ({
  onChange,
  value,
}: {
  onChange: (value: null | string) => void
  value: any
}) => {
  const myUserId = useUserId()
  const [userIdText, setUserIdText] = useState(value)

  return (
    <>
      <TextInput
        label="Filter By User ID"
        value={userIdText}
        onChange={(e) => {
          setUserIdText(e.target.value)
          onChange(e.target.value)
        }}
        size="small"
      />
      {myUserId ? (
        <Button
          onClick={() => {
            setUserIdText(myUserId)
            onChange(myUserId)
          }}
          color="secondary"
          size="small">
          Use Mine
        </Button>
      ) : null}
    </>
  )
}

const EqualInput = ({
  filter,
  onChange,
  value,
}: {
  filter: EqualFilter<any>
  onChange: (value: null | string) => void
  value: any
}) => {
  if (filter.subType === FilterSubType.UserId) {
    return <UserIdInput value={value} onChange={(newId) => onChange(newId)} />
  }

  return (
    <>
      <TextInput
        label={filter.label || 'Equals'}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
        }}
        size="small"
      />
      {filter.suggestions ? (
        <Select label="Suggestions" size="small">
          {filter.suggestions.map((suggestion) => (
            <MenuItem key={suggestion} onClick={() => onChange(suggestion)}>
              {suggestion}
            </MenuItem>
          ))}
        </Select>
      ) : null}
    </>
  )
}

const FilterRenderer = ({
  filter,
  onChange,
  value,
}: {
  filter: Filter<any>
  onChange: (value: null | any) => void
  value: any
}) => {
  switch (filter.type) {
    case FilterType.Equal:
      return (
        <EqualInput
          filter={filter as EqualFilter<any>}
          value={value}
          onChange={onChange}
        />
      )
    case FilterType.Multichoice:
      return (
        <MultichoiceInput
          filter={filter as MultichoiceFilter<any, any>}
          value={value}
          onChange={onChange}
        />
      )
    default:
      return <>Unknown filter "{JSON.stringify(filter)}"</>
  }
}

const MultichoiceInput = ({
  filter,
  value,
  onChange,
}: {
  filter: MultichoiceFilter<any, any>
  value: any[]
  onChange: (newVal: any[]) => void
}) => {
  const actualValue = value || filter.default

  const onSelect = (id: string) =>
    onChange(
      actualValue.includes(id)
        ? actualValue.filter((subId) => subId !== id)
        : actualValue.concat([id])
    )

  return (
    <ButtonDropdown
      label={filter.label || 'Select an option'}
      color="secondary"
      options={filter.options.map((enumKey) => ({
        id: enumKey,
        label: enumKey,
      }))}
      selectedIds={actualValue}
      onSelect={onSelect}
      closeOnSelect={false}
      size="small"
    />
  )
}

function FilterControl({
  filter,
  value,
  isEnabled,
  onToggle,
  onChange,
}: {
  filter: Filter<any>
  value: any
  isEnabled: boolean
  onToggle: () => void
  onChange: (newVal: any) => void
}) {
  const classes = useStyles()
  return (
    <div className={classes.filter}>
      <FormControlLabel
        control={
          <Switch size="small" checked={isEnabled} onChange={onToggle} />
        }
        label={filter.label}
      />
      {isEnabled ? (
        <FilterRenderer filter={filter} value={value} onChange={onChange} />
      ) : null}
    </div>
  )
}

const Filters = <T,>({
  filters,
  storageKey,
}: {
  filters: Filter<T>[]
  storageKey: string
}) => {
  const [activeFilters, setActiveFilters] = useFilters<T>(storageKey)
  const [unappliedFilters, setUnappliedFilters] =
    useState<ActiveFilter<T>[]>(activeFilters)
  const classes = useStyles()

  const toggleFilter = (filter: Filter<T>) => {
    const newFilters =
      unappliedFilters.find(
        (activeFilter) => activeFilter.fieldName === filter.fieldName
      ) !== undefined
        ? unappliedFilters.filter(
            (activeFilter) => activeFilter.fieldName !== filter.fieldName
          )
        : unappliedFilters.concat([
            {
              ...filter,
              value: null,
            },
          ])

    setUnappliedFilters(newFilters)
  }

  const changeFilter = (filter: Filter<T>, newVal: null | any) => {
    const newFilters = unappliedFilters.map((unappliedFilter) =>
      unappliedFilter.fieldName === filter.fieldName
        ? {
            ...unappliedFilter,
            value: newVal,
          }
        : unappliedFilter
    )

    setUnappliedFilters(newFilters)
  }

  const onApply = () => {
    const newActiveFilters = unappliedFilters.filter(
      (filter) => filter.value !== null
    )

    setActiveFilters(newActiveFilters)
  }

  return (
    <div className={classes.root}>
      <div className={classes.filters}>
        {filters.map((filter) => (
          <FilterControl
            key={filter.fieldName as string}
            filter={filter}
            isEnabled={
              unappliedFilters
                ? unappliedFilters.find(
                    (activeFilter) =>
                      activeFilter.fieldName === filter.fieldName
                  ) !== undefined
                : false
            }
            value={
              unappliedFilters.find(
                (unappliedFilter) =>
                  unappliedFilter.fieldName === filter.fieldName
              )?.value
            }
            onToggle={() => toggleFilter(filter)}
            onChange={(newVal) => changeFilter(filter, newVal)}
          />
        ))}
      </div>
      <Button onClick={onApply} size="small" icon={<FilterIcon />}>
        Apply Filters
      </Button>
    </div>
  )
}

export default Filters
