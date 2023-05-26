import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useCategoryMeta from '../../hooks/useCategoryMeta'

import Button from '../button'
import Heading from '../heading'
import SpeciesVsSelector from '../species-vs-selector'

const useStyles = makeStyles({
  doneBtn: {
    marginTop: '1rem',
    textAlign: 'center'
  },
  items: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  item: {
    width: '50%',
    padding: '0.5rem',
    position: 'relative'
  },
  contentsWrapper: {
    display: 'flex'
  },
  media: {
    width: '200px',
    height: '200px',
    flexShrink: 0
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  content: {
    flex: 1
  },
  // TODO: Invert theme and share components with category selector
  isSelected: {
    backgroundColor: 'grey',
    boxShadow: '0px 0px 10px #FFF'
  }
})

export default ({
  selectedCategory,
  title = '',
  onSelect,
  onDeSelect,
  selectedSpeciesIds,
  onDone
}) => {
  const classes = useStyles()
  const { nameSingular } = useCategoryMeta(selectedCategory)

  return (
    <>
      <Heading variant="h1">
        Upload {title ? `"${title}"` : nameSingular}
      </Heading>
      <Heading variant="h2">Select a species</Heading>
      <p>
        Each asset on VRCArena is categorized by their species to help people
        find related content. Pick a species below (or click Skip if it does not
        belong to a single species).
      </p>
      <p>
        <em>
          Can't find your species? Click Skip for now and join our Discord to
          suggest adding it!
        </em>
      </p>
      <SpeciesVsSelector
        selectedSpeciesIds={selectedSpeciesIds}
        onSpeciesClickWithId={speciesId => {
          if (selectedSpeciesIds.includes(speciesId)) {
            onDeSelect(speciesId)
          } else {
            onSelect(speciesId)
          }
        }}
      />
      <div className={classes.doneBtn}>
        {selectedSpeciesIds.length ? (
          <Button size="large" onClick={() => onDone()}>
            Done
          </Button>
        ) : (
          <Button onClick={() => onDone()} color="default">
            Skip
          </Button>
        )}
      </div>
    </>
  )
}
