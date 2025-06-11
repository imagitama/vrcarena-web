import React from 'react'
import { makeStyles } from '@mui/styles'
import { FullSpecies, Species } from '../../modules/species'
import Link from '../../components/link'
import * as routes from '../../routes'
import LazyLoad from 'react-lazyload'
import { VRCArenaTheme } from '../../themes'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    width: 'calc(100% - 0.25rem)',
    position: 'relative',
    paddingRight: '0.25rem',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    '& a': {
      flex: 1,
      color: 'inherit',
      display: 'flex',
      alignItems: 'center',
      borderRadius: theme.shape.borderRadius,
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
    width: '30px', // half thumb
    height: '50px',
    margin: '-40px -10px 0 0', // hide border radius
    borderRadius: `0 0 0 ${theme.shape.borderRadius * 2}px`,
    zIndex: -5,
    position: 'relative',
    border: '2px solid rgba(100, 100, 100)',
    borderTop: 'none',
    borderRight: 'none',
  },
  children: {
    '& > *': {
      marginTop: '0.25rem',
    },
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
  line: {
    width: '2px',
    backgroundColor: 'rgba(100, 100, 100)',
    height: '50px',
    position: 'absolute',
    left: '20px',
    top: '-50px',
  },
}))

const isFull = (thing: Species | FullSpecies): thing is FullSpecies =>
  'avatarcount' in thing

const SpeciesResultItem = ({
  index,
  speciesItem,
  indent = 0,
  children,
  className,
}: {
  index?: number
  speciesItem: FullSpecies | Species
  indent?: number
  children?: React.ReactNode
  className?: string
}) => {
  const classes = useStyles()
  return (
    <div className={`${classes.root} ${className || ''}`}>
      {index !== undefined && index > 0 && <div className={classes.line} />}
      {indent > 0 && (
        <div
          className={classes.connector}
          style={{ marginLeft: `calc(20px * ${indent})` }}></div>
      )}
      <Link
        to={routes.viewSpeciesWithVar.replace(
          ':speciesIdOrSlug',
          speciesItem.slug || speciesItem.id
        )}>
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
