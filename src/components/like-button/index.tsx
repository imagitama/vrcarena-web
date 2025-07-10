import React from 'react'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import { makeStyles } from '@mui/styles'

import useUserId from '../../hooks/useUserId'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'
import { handleError } from '../../error-handling'
import { deleteRecord } from '../../data-store'
import useSupabaseClient from '../../hooks/useSupabaseClient'
import { CollectionNames, Like } from '../../modules/likes'

const useStyles = makeStyles({
  root: {
    opacity: 0.3,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  liked: {
    opacity: 1,
  },
  icon: {
    fontSize: 'inherit',
  },
})

export default ({
  collectionName,
  parentId,
}: {
  collectionName: string
  parentId: string
}) => {
  const userId = useUserId()
  const [, lastErrorCodeLoadingLikes, result] = useDatabaseQuery<Like>(
    CollectionNames.Likes,
    userId
      ? [
          ['parent', Operators.EQUALS, parentId],
          ['createdby', Operators.EQUALS, userId],
        ]
      : false
  )
  const [, , , save] = useDataStoreEdit(CollectionNames.Likes, parentId)
  const classes = useStyles()
  const supabase = useSupabaseClient()

  const hasLiked = result && result.length > 0

  const onBtnClick = async () => {
    try {
      if (!hasLiked) {
        await save({
          parent: parentId,
        })
      } else {
        await deleteRecord(supabase, CollectionNames.Likes, result[0].id)
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (lastErrorCodeLoadingLikes) {
    return <>Error loading like (code {lastErrorCodeLoadingLikes})</>
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
