import React, { useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import { FullSpecies, Species } from '../../modules/species'
import Link from '../../components/link'
import * as routes from '../../routes'
import LazyLoad from 'react-lazyload'
import { VRCArenaTheme } from '../../themes'
import Tooltip from '../tooltip'
import LoadingShimmer from '../loading-shimmer'
import { getRandomInt } from '../../utils'
import { colorPalette } from '@/config'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    width: 'calc(100% - 0.25rem)',
    position: 'relative',
    paddingRight: '0.25rem',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    userSelect: 'none',
  },
  clicker: {
    cursor: 'pointer',
    flex: 1,
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: 'rgba(50, 50, 50)',
    },
  },
  selected: {
    backgroundColor: colorPalette.selectedBg,
    boxShadow: colorPalette.selectedBoxShadow,
  },
  selectedByParent: {
    backgroundColor: 'rgb(50, 50, 0) !important',
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
    backgroundColor: 'rgba(100, 100, 100)',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    '& img': {
      width: '100%',
      height: '100%',
      display: 'block',
    },
  },
  text: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
    width: '100%',
    '& > *': {
      marginTop: '0.25rem',
    },
  },
  count: {
    fontSize: '75%',
    marginLeft: '0.25rem',
    color: 'rgb(150, 150, 150)',
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
  shimmer,
  index,
  speciesItem,
  indent = 0,
  children,
  className,
  isSelectable,
  isSelected,
  onClick,
  isSelectedByParent,
}: {
  shimmer?: boolean
  index?: number
  speciesItem?: FullSpecies | Species
  indent?: number
  children?: React.ReactNode
  className?: string
  // change species form
  isSelectable?: boolean
  isSelected?: boolean
  onClick?: (id: string) => void
  isSelectedByParent?: boolean
}) => {
  const classes = useStyles()
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Tooltip
      title={
        isSelectable && onClick
          ? ''
          : 'You cannot select this (you may have children or a parent already selected)'
      }>
      {onClick && speciesItem ? (
        <div
          className={`${classes.clicker} ${
            isSelected ? classes.selected : ''
          } ${isSelectedByParent ? classes.selectedByParent : ''}`}
          onClick={() => onClick(speciesItem.id)}>
          {children}
        </div>
      ) : (
        <Link
          to={routes.viewSpeciesWithVar.replace(
            ':speciesIdOrSlug',
            speciesItem ? speciesItem.slug || speciesItem.id : ''
          )}
          className={`${classes.clicker} ${
            isSelected ? classes.selected : ''
          } ${isSelectedByParent ? classes.selectedByParent : ''}`}>
          {children}
        </Link>
      )}
    </Tooltip>
  )

  return (
    <div className={`${classes.root} ${className || ''}`}>
      {index !== undefined && index > 0 && <div className={classes.line} />}
      {indent > 0 && (
        <div
          className={classes.connector}
          style={{ marginLeft: `calc(20px * ${indent})` }}></div>
      )}
      <Wrapper>
        <LazyLoad placeholder={<div />} className={classes.thumbnail}>
          {speciesItem?.thumbnailurl ? (
            <img src={speciesItem.thumbnailurl} />
          ) : null}
        </LazyLoad>
        <div className={classes.text}>
          <div className={classes.name}>
            {speciesItem ? (
              speciesItem.pluralname
            ) : (
              <LoadingShimmer
                width={`${getRandomInt(25, 100)}%`}
                height="30px"
              />
            )}
            {speciesItem && isFull(speciesItem) ? (
              <span className={classes.count}>({speciesItem.avatarcount})</span>
            ) : null}
          </div>
          <div className={classes.description}>
            {speciesItem
              ? speciesItem.shortdescription
              : [
                  <LoadingShimmer width="100%" height="10px" key={0} />,
                  <LoadingShimmer
                    width={`${getRandomInt(25, 100)}%`}
                    height="10px"
                    key={1}
                  />,
                ]}
          </div>
        </div>
      </Wrapper>
      <div className={classes.children}>{children}</div>
    </div>
  )
}

export default SpeciesResultItem
