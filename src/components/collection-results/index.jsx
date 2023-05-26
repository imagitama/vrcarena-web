import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CollectionResultsItem from '../collection-results-item'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
  item: {
    padding: '5px',
    width: '100%'
  }
})

export default ({ collections }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {collections.map(collection => (
        <div className={classes.item}>
          <CollectionResultsItem key={collection.id} collection={collection} />
        </div>
      ))}
    </div>
  )
}
