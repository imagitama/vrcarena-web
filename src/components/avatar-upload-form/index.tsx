import React from 'react'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import ImageUploader from '../image-uploader'
import Heading from '../heading'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import useUserRecord from '../../hooks/useUserRecord'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'
import {
  AVATAR_HEIGHT,
  AVATAR_WIDTH,
  NONATTACHMENT_MAX_SIZE_BYTES,
} from '../../config'
import { bucketNames } from '../../file-uploading'
import { CollectionNames, User } from '../../modules/users'
import Avatar from '../avatar'

const AvatarUploadForm = ({
  onClick = undefined,
}: {
  onClick?: () => void
}) => {
  const userId = useUserId()
  const [, , user, hydrate] = useUserRecord()
  const [isSaving, , lastErrorCode, save] = useDataStoreEdit<User>(
    CollectionNames.Users,
    userId!
  )

  const onUploadedWithUrls = async (urls: string[]) => {
    try {
      const url = urls[0]

      if (onClick) {
        onClick()
      }

      await save({
        avatarurl: url,
      })

      hydrate()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (!user || !userId) {
    return <>Waiting for user</>
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to upload your avatar (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  return (
    <>
      <Heading variant="h3">Current Avatar</Heading>
      <Avatar url={user.avatarurl} />
      <Heading variant="h3">Upload New Avatar</Heading>
      <ImageUploader
        onDone={onUploadedWithUrls}
        bucketName={bucketNames.userAvatars}
        directoryPath={userId}
        requiredWidth={AVATAR_WIDTH}
        requiredHeight={AVATAR_HEIGHT}
        maxSizeBytes={NONATTACHMENT_MAX_SIZE_BYTES}
      />
    </>
  )
}

export default AvatarUploadForm
