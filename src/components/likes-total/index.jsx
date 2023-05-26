import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  LikeFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  root: {
    display: 'inline'
  }
})

export default ({ collectionName, parentId }) => {
  const [, isError, results] = useDatabaseQuery(CollectionNames.Likes, [
    [
      LikeFieldNames.parent,
      Operators.EQUALS,
      createRef(collectionName, parentId)
    ]
  ])
  const classes = useStyles()

  if (isError) {
    return 'Error loading likes'
  }

  if (!results || !results.length) {
    return null
  }

  return <div className={classes.root}>{results.length} users liked this</div>
}
