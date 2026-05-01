import React, { useContext } from 'react'
import { makeStyles } from '@mui/styles'

import { mediaQueryForTabletsOrBelow } from '@/media-queries'
import { getIsUserCreator } from '@/utils/assets'
import { CollectionNames } from '@/modules/assets'

import useIsEditor from '@/hooks/useIsEditor'
import useUserId from '@/hooks/useUserId'

import CommentList from '@/components/comment-list'
import Heading from '@/components/heading'

import TabContext from '../../context'

const useStyles = makeStyles({
  root: {
    maxWidth: '50%',
    margin: '0 auto',
    [mediaQueryForTabletsOrBelow]: {
      maxWidth: '100%',
    },
  },
})

export default () => {
  const { assetId, isLoading, asset } = useContext(TabContext)
  const classes = useStyles()
  const isEditor = useIsEditor()
  const userId = useUserId()

  if (isLoading) {
    return (
      <div className={classes.root}>
        <CommentList shimmer />
      </div>
    )
  }

  const isUserCreator = userId && asset && getIsUserCreator(userId, asset)

  return (
    <div className={classes.root}>
      <CommentList collectionName={CollectionNames.Assets} parentId={assetId} />
      {isEditor || isUserCreator ? (
        <>
          <Heading variant="h2">Private Comments</Heading>
          <p>
            These comments are only visible to staff and the user who posted
            this asset.
          </p>
          <CommentList
            collectionName={CollectionNames.Assets}
            parentId={assetId}
            getPrivate
          />
        </>
      ) : null}
    </div>
  )
}
