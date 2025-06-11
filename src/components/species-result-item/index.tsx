import React from 'react'
import { makeStyles } from '@mui/styles'
import { FullSpecies, Species } from '../../modules/species'
import Link from '../../components/link'
import * as routes from '../../routes'
import LazyLoad from 'react-lazyload'
import { VRCArenaTheme } from '../../themes'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    width: '100%',
    '& a': {
      color: 'inherit',
      display: 'flex',
      alignItems: 'center',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  item: {
    padding: '0.25rem',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
  },
  thumbnail: {
    flexShrink: 0,
    width: '80px',
    height: '80px',
    marginRight: '0.5rem',
    backgroundColor: 'rgba(150, 150, 150)',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    '& img': {
      width: '100%',
      height: '100%',
      display: 'block',
    },
  },
  name: {
    fontSize: '125%',
    fontWeight: 400,
    marginBottom: '0.1rem',
    width: '100%',
  },
  description: {
    width: '100%',
    fontSize: '75%',
    fontStyle: 'italic',
    color: 'rgb(150, 150, 150)',
  },
  connector: {
    flexShrink: 0,
    width: '50px', // half thumb
    height: '50px',
    margin: '-50px -10px 0 0', // hide border radius
    borderRadius: theme.shape.borderRadius * 2,
    zIndex: -5,
    position: 'relative',
    border: '2px solid rgba(150, 150, 150)',
    borderTop: 'none',
    borderRight: 'none',
  },
  children: {
    marginTop: '0.25rem',
  },
  count: {
    fontSize: '75%',
    marginLeft: '0.5rem',
  },
  text: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
}))

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
    <div className={`${classes.root} ${className}`}>
      <Link
        to={routes.viewSpeciesWithVar.replace(
          ':speciesIdOrSlug',
          speciesItem.slug || speciesItem.id
        )}>
        {indent > 0 && (
          <div
            className={classes.connector}
            style={{ marginLeft: `calc(30px * ${indent})` }}></div>
        )}
        {speciesItem.thumbnailurl ? (
          <LazyLoad placeholder={<div />} className={classes.thumbnail}>
            <img src={speciesItem.thumbnailurl} />
          </LazyLoad>
        ) : null}
        <div className={classes.text}>
          <div className={classes.name}>
            {speciesItem.pluralname}
            {isFull(speciesItem) ? (
              <span className={classes.count}>({speciesItem.avatarcount})</span>
            ) : null}
          </div>
          <div className={classes.description}>
            {speciesItem.shortdescription}
          </div>
        </div>
      </Link>
      <div className={classes.children}>{children}</div>
    </div>
  )
}

export default SpeciesResultItem
