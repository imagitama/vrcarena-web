import React from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import { PlaylistsFieldNames } from '../../data-store'
import * as routes from '../../routes'
import Paper from '../paper'

const useStyles = makeStyles({
  root: {},
})

export default ({
  collection: {
    id,
    [PlaylistsFieldNames.title]: title,
    [PlaylistsFieldNames.items]: items,
  },
}) => {
  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <Typography variant="h5" component="h2">
        <Link to={routes.viewCollectionWithVar.replace(':collectionId', id)}>
          {title || '(no title)'}
        </Link>{' '}
        {items ? ` (${items.length})` : ''}
      </Typography>
      {/* <Markdown source={description} /> */}
    </Paper>
  )
}
