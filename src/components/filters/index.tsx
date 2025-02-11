import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import useFilters, { StoredFilter } from '../../hooks/useFilters'
import Button from '../button'
import TextInput from '../text-input'
import Select, { MenuItem } from '../select'
import useUserId from '../../hooks/useUserId'

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
  },
})

const UserIdInput = ({
  onChange,
  initialValue,
}: {
  onChange: (value: null | string) => void
  initialValue: FilterValue
}) => {
  const userId = useUserId()
  const [userIdText, setUserIdText] = useState(initialValue)

  return (
    <>
      <TextInput
        label="Filter By User ID"
        value={userIdText}
        onChange={(e) => {
          setUserIdText(e.target.value)
          onChange(e.target.value)
        }}
      />
      {userId ? (
        <Button
          onClick={() => {
            setUserIdText(userId)
            onChange(userId)
          }}
          color="default"
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
  initialValue,
}: {
  filter: Filter<any>
  onChange: (value: null | string) => void
  initialValue: FilterValue
}) => {
  const [text, setText] = useState(initialValue)

  return (
    <>
      <TextInput
        label="Filter"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          onChange(e.target.value)
        }}
      />
      {filter.suggestions ? (
        <Select label="Suggestions">
          {filter.suggestions.map((suggestion) => (
            <MenuItem
              key={suggestion}
              onClick={() => {
                setText(suggestion)
                onChange(suggestion)
              }}>
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
  initialValue,
}: {
  filter: Filter<any>
  onChange: (value: null | string) => void
  initialValue: FilterValue
}) => {
  switch (filter.type) {
    case FilterType.Equal:
      return (
        <EqualInput
          filter={filter}
          initialValue={initialValue}
          onChange={onChange}
        />
      )
    case FilterType.UserId:
      return <UserIdInput initialValue={initialValue} onChange={onChange} />
    default:
      return <>Unknown filter type "{filter.type}"</>
  }
}

type FilterValue = string

function FilterControl({
  filter,
  initialValue,
  isEnabled,
  onToggle,
  onChange,
}: {
  filter: Filter<any>
  initialValue: FilterValue
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
        <FilterRenderer
          filter={filter}
          initialValue={initialValue}
          onChange={onChange}
        />
      ) : null}
    </div>
  )
}

export enum FilterType {
  Equal,
  UserId,
}

export interface Filter<T> {
  fieldName: Extract<keyof T, string>
  type: FilterType
  label: string
  suggestions?: string[]
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
    useState<StoredFilter<T>[]>(activeFilters)
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
              fieldName: filter.fieldName,
              value: null,
            },
          ])

    console.debug(`toggleFilter`, filter.fieldName, { newFilters })

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

    console.debug(`changeFilter`, filter.fieldName, newVal)

    setUnappliedFilters(newFilters)
  }

  const onApply = () =>
    setActiveFilters(unappliedFilters.filter((filter) => filter.value !== null))

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
            initialValue={
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
      <Button onClick={onApply}>Apply</Button>
    </div>
  )
}

export default Filters
