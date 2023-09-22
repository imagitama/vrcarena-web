import React from 'react'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import ImageUploader from '../image-uploader'
import Heading from '../heading'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, UserFieldNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'
import defaultAvatarUrl from '../../assets/images/default-avatar.png'
import {
  AVATAR_HEIGHT,
  AVATAR_WIDTH,
  NONATTACHMENT_MAX_SIZE_BYTES
} from '../../config'
import { bucketNames } from '../../file-uploading'
import WarningMessage from '../warning-message'

export default ({ onClick = undefined }: { onClick?: () => void }) => {
  const userId = useUserId()
  const [, , user, hydrate] = useUserRecord()
  const [isSaving, , isErrored, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )

  const onUploadedWithUrls = async (urls: string[]) => {
    try {
      const url = urls[0]

      if (onClick) {
        onClick()
      }

      await save({
        [UserFieldNames.avatarUrl]: url
      })

      hydrate()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (!user) {
    return null
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to upload your avatar</ErrorMessage>
  }

  return (
    <>
      <Heading variant="h3">Current Avatar</Heading>
      <br />
      <img
        src={user.avatarurl || defaultAvatarUrl}
        alt="Your avatar"
        width={AVATAR_WIDTH}
        height={AVATAR_HEIGHT}
      />
      <Heading variant="h3">Upload New Avatar</Heading>
      <WarningMessage>
        As of April 2023 we are migrating to a new way of uploading avatars.
        Please contact me (Peanut#1756) if you experience any issues with this
      </WarningMessage>
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
