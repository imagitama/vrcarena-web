import React from 'react'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import { makeStyles } from '@material-ui/core/styles'

import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseQuery, {
  CollectionNames,
  LikeFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import { createRef } from '../../utils'
import { handleError } from '../../error-handling'
import { deleteRecord } from '../../data-store'

const useStyles = makeStyles({
  root: {
    opacity: 0.3,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  liked: {
    opacity: 1
  },
  icon: {
    fontSize: 'inherit'
  }
})

export default ({ collectionName, parentId }) => {
  const userId = useUserId()
  const [, isErrorLoadingLikes, result] = useDatabaseQuery(
    CollectionNames.Likes,
    userId
      ? [
          [
            LikeFieldNames.parent,
            Operators.EQUALS,
            createRef(collectionName, parentId)
          ],
          [
            LikeFieldNames.createdBy,
            Operators.EQUALS,
            createRef(CollectionNames.Users, userId)
          ]
        ]
      : false
  )
  const [, , , save] = useDatabaseSave(CollectionNames.Likes, parentId)
  const classes = useStyles()

  const hasLiked = result && result.length > 0

  const onBtnClick = async () => {
    try {
      if (!hasLiked) {
        await save({
          [LikeFieldNames.parent]: createRef(collectionName, parentId)
        })
      } else {
        await deleteRecord(CollectionNames.Likes, result[0].id)
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isErrorLoadingLikes) {
    return 'Error loading if you like or not'
  }

  if (!userId) {
    return null
  }

  return (
    <div
      className={`${classes.root} ${hasLiked ? classes.liked : ''}`}
      onClick={onBtnClick}>
      <ThumbUpIcon className={classes.icon} />
    </div>
  )
}
