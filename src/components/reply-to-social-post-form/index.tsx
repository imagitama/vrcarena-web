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
      initialUsernameMapping={{
        [originalUsername]: originalUserId,
      }}
      onDone={hydrate}
      autoFocus={true}
    />
  )
}

export default ReplyToSocialPostForm
