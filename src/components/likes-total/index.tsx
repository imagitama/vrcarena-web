import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'
import { CollectionNames } from '../../modules/likes'

const useStyles = makeStyles({
  root: {
    display: 'inline',
  },
})

export default ({
  collectionName,
  parentId,
}: {
  collectionName: string
  parentId: string
}) => {
  const [, isError, results] = useDatabaseQuery(CollectionNames.Likes, [
    ['parent', Operators.EQUALS, parentId],
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
