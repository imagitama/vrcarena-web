import React from 'react'
import { makeStyles } from '@mui/styles'
import { FullSpecies, Species } from '../../modules/species'
import Link from '../../components/link'
import * as routes from '../../routes'

const useStyles = makeStyles({
  root: {
    padding: '0.25rem',
    '& a': {
      color: 'inherit',
      display: 'block',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  thumbnailPlaceholder: {},
  title: {
    display: 'flex',
    alignItems: 'center',
    '& img, & .thumbnailPlaceholder': {
      width: '100px',
      height: '100px',
      marginRight: '0.5rem',
    },
  },
  name: {
    fontSize: '150%',
    marginBottom: '0.1rem',
  },
  description: {
    fontSize: '75%',
    fontStyle: 'italic',
  },
})

const isFull = (thing: Species | FullSpecies): thing is FullSpecies =>
  'avatarcount' in thing

const SpeciesResultItem = ({
  speciesItem,
  indent = 0,
  children,
  className,
}: {
  speciesItem: FullSpecies | Species
  indent?: number
  children?: React.ReactNode
  className?: string
}) => {
  const classes = useStyles()
  return (
    <div
      className={`${classes.root} ${className}`}
      style={{ marginLeft: `calc(2rem * ${indent})` }}>
      <Link
        to={routes.viewSpeciesWithVar.replace(
          ':speciesIdOrSlug',
          speciesItem.slug || speciesItem.id
        )}>
        <div className={classes.title}>
          {speciesItem.thumbnailurl ? (
            <img src={speciesItem.thumbnailurl} />
          ) : (
            <div className={classes.thumbnailPlaceholder} />
          )}{' '}
          <div>
            <div className={classes.name}>
              {speciesItem.pluralname}
              {isFull(speciesItem) ? ` (${speciesItem.avatarcount})` : null}
            </div>
            <div className={classes.description}>
              {speciesItem.shortdescription}
            </div>
          </div>
        </div>
      </Link>
      {children}
    </div>
  )
}

export default SpeciesResultItem
