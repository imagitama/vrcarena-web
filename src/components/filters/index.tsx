import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import useFilters, { StoredFilter } from '../../hooks/useFilters'
import Button from '../button'
import TextInput from '../text-input'
import Select, { MenuItem } from '../select'
import useUserId from '../../hooks/useUserId'
import ButtonDropdown from '../button-dropdown'

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
  value,
}: {
  onChange: (value: null | string) => void
  value: any
}) => {
  const userId = useUserId()
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
  value,
}: {
  filter: EqualFilter<any>
  onChange: (value: null | string) => void
  value: any
}) => {
  const [text, setText] = useState(value)

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
    case FilterType.UserId:
      return <UserIdInput value={value} onChange={onChange} />
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
      label="Status"
      color="default"
      options={filter.options.map((enumKey) => ({
        id: enumKey,
        label: enumKey,
      }))}
      selectedIds={actualValue}
      onSelect={onSelect}
      closeOnSelect={false}
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

export enum FilterType {
  Equal,
  UserId,
  Multichoice,
}

interface BaseFilter<TRecord> {
  fieldName: Extract<keyof TRecord, string>
  type: FilterType
  label: string
}

interface EqualFilter<TRecord> extends BaseFilter<TRecord> {
  type: FilterType.Equal
  suggestions?: string[]
}

interface MultichoiceFilter<TRecord, TEnum> extends BaseFilter<TRecord> {
  type: FilterType.Multichoice
  options: TEnum[]
  default: TEnum[]
}

export type Filter<TRecord, TEnum = undefined> =
  | MultichoiceFilter<TRecord, TEnum>
  | EqualFilter<TRecord>
  | BaseFilter<TRecord>

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
      <Button onClick={onApply}>Apply</Button>
    </div>
  )
}

export default Filters
