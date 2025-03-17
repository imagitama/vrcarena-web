import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import * as routes from '../../routes'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import { Collection, FullCollection } from '../../modules/collections'
import ResultsItem from '../results-item'

const useStyles = makeStyles({
  root: {
    width: '200px',
    transition: 'all 100ms',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
    },
    '& a': {
      color: 'inherit',
    },
    '&:hover $relation svg': {
      transform: 'rotate(360deg) !important',
    },
  },
  tiny: {
    width: '100%',
    fontSize: '75%',
    '& $cardMedia': {
      width: '100px',
      height: '100px',
    },
    '& $cardContent': {
      padding: '5px',
    },
    '& a': {
      display: 'flex',
    },
  },
  button: {
    font: 'inherit',
  },
  selected: {
    backgroundColor: '#656565',
  },
  dimmed: {
    opacity: 0.5,
  },
  // overrides
  cardContent: {
    overflow: 'hidden', // for tiny clipping
    padding: '12px',
    '&:last-child': {
      paddingBottom: '12px',
    },
  },
  cardMedia: {
    transition: 'all 500ms',
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px',
    },
    overflow: 'hidden', // fix onClick in controls not working
  },
  // parts
  title: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.15em',
    '& span': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '& svg': {
      marginLeft: '2px',
      fontSize: '0.8em',
    },
  },
  author: {
    fontSize: '0.85em',
    marginBottom: '6px',
  },
  microText: {
    fontSize: '0.85em',
    textTransform: 'uppercase',
    lineHeight: '1.25',
    height: '16px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#C9C9C9',
  },
  relation: {
    display: 'inline-flex',
    alignItems: 'center',
    '& svg': {
      fontSize: '1em',
      transform: 'rotate(90deg)',
      transition: 'transform 500ms',
    },
  },
  moreInfo: {
    marginTop: '6px',
    display: 'flex',
  },
  controls: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  control: {
    padding: 0,
    marginRight: '0.25rem',
    opacity: '0.5',
    transition: '100ms all',
    filter: 'drop-shadow(1px 1px 1px #000)',
    '&:hover': {
      opacity: 1,
    },
  },
})
const CollectionResultsItem = ({
  collection: {
    id,
    title,
    items,
    description,
    // isadult,
    thumbnailurl,
    createdat,
    createdbyusername,
    createdbyavatarurl,
  },
}: {
  collection: FullCollection | Collection
}) => (
  <ResultsItem
    title={title}
    thumbnailUrl={thumbnailurl}
    linkUrl={routes.viewCollectionWithVar.replace(':collectionId', id)}
    description={`${(items || []).length} assets`}
    createdbyusername={createdbyusername as string}
  />
)

export default CollectionResultsItem
