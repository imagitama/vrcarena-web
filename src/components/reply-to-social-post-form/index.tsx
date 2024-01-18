import React from 'react'
import CreateSocialPostForm from '../create-social-post-form'

const ReplyToSocialPostForm = ({
  postId,
  originalUserId,
  originalUsername,
  hydrate,
}: {
  postId: string
  originalUserId: string
  originalUsername: string
  hydrate?: () => void
}) => {
  return (
    <CreateSocialPostForm
      replyParentId={postId}
      // initialText={`[user:${originalUserId}] `}
      initialUsernameMapping={{
        [originalUsername]: originalUserId,
      }}
      onDone={hydrate}
    />
  )
}

export default ReplyToSocialPostForm
