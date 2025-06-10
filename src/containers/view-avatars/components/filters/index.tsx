import React from 'react'
import { makeStyles } from '@mui/styles'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

import useStorage from '../../../../hooks/useStorage'
import { trackAction } from '../../../../analytics'
import { importantTags } from '../../../../config'
import Heading from '../../../../components/heading'

const analyticsActionCategory = 'AvatarPages'

const useStyles = makeStyles({
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    paddingLeft: '0.5rem',
  },
  filter: {
    marginRight: '0.5rem',
  },
})

const avatarsFiltersStorageKey = 'avatar-filters'

const allFilters = [
  {
    label: 'Quest compatible',
    tag: 'quest',
  },
  {
    label: 'Full-body ready',
    tag: 'full_body_ready',
  },
  {
    label: 'VRChat SDK3',
    tag: 'sdk3',
  },
  {
    label: 'Resonite/NeosVR Ready',
    tag: importantTags.neosvr_compatible,
  },
  {
    label: 'ChilloutVR Ready',
    tag: importantTags.chilloutvr_compatible,
  },
  {
    label: 'Free',
    tag: importantTags.free,
  },
]

function Filter({
  label,
  isEnabled,
  onClick,
}: {
  label: string
  isEnabled: boolean
  onClick: () => void
}) {
  const classes = useStyles()
  return (
    <div className={classes.filter}>
      <FormControlLabel
        control={<Switch size="small" checked={isEnabled} onChange={onClick} />}
        label={label}
      />
    </div>
  )
}

export default () => {
  const classes = useStyles()
  const [activeFilters, storeActiveFilters] = useStorage<string[]>(
    avatarsFiltersStorageKey,
    []
  )

  return (
    <>
      <Heading variant="h2">Filters</Heading>
      <div className={classes.filters}>
        {allFilters.map(({ label, tag }) => (
          <Filter
            key={tag}
            label={label}
            isEnabled={activeFilters.includes(tag)}
            onClick={() => {
              const isActive = activeFilters.includes(tag)
              const newActiveFilters = isActive
                ? activeFilters.filter((item) => item !== tag)
                : activeFilters.concat([tag])
              storeActiveFilters(newActiveFilters)
              trackAction(
                analyticsActionCategory,
                isActive ? 'Disable tag filter' : 'Enable tag filter',
                tag
              )
            }}
          />
        ))}
      </div>
    </>
  )
}
