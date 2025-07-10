import React, { createContext, useContext, useState } from 'react'
import { makeStyles } from '@mui/styles'
import DeleteIcon from '@mui/icons-material/Delete'
import ImageIcon from '@mui/icons-material/Image'

import { handleError } from '../../error-handling'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'
import {
  CollectionNames,
  SocialAttachment,
  SocialAttachmentType,
  SocialPost,
} from '../../modules/social'
import Button from '../button'
import CheckboxInput from '../checkbox-input'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import useUserId from '../../hooks/useUserId'
import ImageUploader from '../image-uploader'
import { bucketNames } from '../../file-uploading'
import Paper from '../paper'
import * as routes from '../../routes'
import MentionsInput, { UsernameMapping } from '../mentions-input'
import { DataStoreErrorCode } from '../../data-store'

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  uploaderRoot: {
    width: '100%',
    maxWidth: '700px',
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      width: '100%',
    },
  },
  paper: {
    width: '100%',
    display: 'flex',
  },
  inputs: {
    width: '100%',
    marginRight: '1rem',
  },
  attachments: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  attachmentImage: {
    width: '150px',
    margin: '0 0.25rem 0.25rem 0',
    padding: '0.25rem',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    '& img': {
      width: '100%',
    },
  },
})

const Attachment = ({
  attachment,
  onDelete,
}: {
  attachment: SocialAttachment
  onDelete: () => void
}) => {
  const classes = useStyles()

  // TODO: Other types
  return (
    <div className={classes.attachmentImage}>
      <img src={attachment.url} />{' '}
      <Button onClick={onDelete} size="small" icon={<DeleteIcon />} iconOnly />
    </div>
  )
}

const Form = ({ triggerOpen }: { triggerOpen: () => void }) => {
  const classes = useStyles()
  const {
    createdSocialPost,
    internalText,
    setInternalText,
    isAdult,
    setIsAdult,
    isCreatingPost,
    lastErrorCodeCreatingPost,
    isCreatePostSuccess,
    attachments,
    setAttachments,
    onClickCreate,
    initialUsernameMapping,
    autoFocus,
  } = useForm()
  const myUserId = useUserId()

  if (!myUserId) {
    return null
  }

  const isDoingSomething = isCreatingPost || lastErrorCodeCreatingPost !== null

  const removeAttachment = (attachment: SocialAttachment) =>
    setAttachments(attachments.filter((item) => item.url !== attachment.url))

  return (
    <div className={classes.uploaderRoot}>
      {isCreatingPost ? (
        <LoadingIndicator message="Creating post..." />
      ) : lastErrorCodeCreatingPost ? (
        <ErrorMessage>Failed to create post</ErrorMessage>
      ) : isCreatePostSuccess ? (
        <SuccessMessage
          viewRecordUrl={
            createdSocialPost
              ? routes.socialWithPostVar.replace(
                  ':postId',
                  createdSocialPost.id
                )
              : undefined
          }>
          Your post has been created :{')'}
        </SuccessMessage>
      ) : null}
      <Paper className={classes.paper}>
        <div className={classes.inputs}>
          <div>
            <MentionsInput
              value={internalText}
              onChange={(newValue) => setInternalText(newValue)}
              isDisabled={isCreatingPost}
              initialUsernameMapping={initialUsernameMapping}
              autoFocus={autoFocus}
            />
          </div>
          <CheckboxInput
            value={isAdult}
            onChange={(e) => setIsAdult(!isAdult)}
            label="Is NSFW"
          />
          <div className={classes.attachments}>
            {attachments.map((attachment) => (
              <Attachment
                key={attachment.url}
                attachment={attachment}
                onDelete={() => removeAttachment(attachment)}
              />
            ))}
          </div>
          <Button
            size="small"
            color="secondary"
            onClick={triggerOpen}
            icon={<ImageIcon />}>
            Attach
          </Button>
        </div>
        <Button
          size="large"
          onClick={onClickCreate}
          isDisabled={isDoingSomething}>
          Create Post
        </Button>
      </Paper>
    </div>
  )
}

interface FormContext {
  createdSocialPost: SocialPost | null
  internalText: string
  setInternalText: (
    userInputHtml: string | ((currentVal: string) => string)
  ) => void
  isCreatingPost: boolean
  isCreatePostSuccess: boolean
  lastErrorCodeCreatingPost: null | DataStoreErrorCode
  attachments: SocialAttachment[]
  setAttachments: (newAttachments: SocialAttachment[]) => void
  isAdult: boolean
  setIsAdult: (newVal: boolean) => void
  onClickCreate: () => void
  initialUsernameMapping?: UsernameMapping
  autoFocus?: boolean
}

// @ts-ignore
const formContext = createContext<FormContext>()
const useForm = () => useContext(formContext)

const CreateSocialPostForm = ({
  initialText,
  replyParentId,
  onDone,
  initialUsernameMapping,
  autoFocus,
}: {
  initialText?: string
  replyParentId?: string
  onDone?: () => void
  initialUsernameMapping?: UsernameMapping
  autoFocus?: boolean
}) => {
  const [internalText, setInternalText] = useState(initialText || '')
  const [attachments, setAttachments] = useState<SocialAttachment[]>([])
  const [isAdult, setIsAdult] = useState(false)
  const [
    isCreatingPost,
    isCreatePostSuccess,
    lastErrorCodeCreatingPost,
    create,
    ,
    createdSocialPost,
  ] = useDataStoreCreate<SocialPost>(CollectionNames.SocialPosts)
  const myUserId = useUserId()
  const classes = useStyles()

  if (!myUserId) {
    return null
  }

  const onClickCreate = async () => {
    try {
      if (!internalText && !attachments.length) {
        console.warn('new text is empty')
        return
      }

      await create({
        text: internalText,
        isadult: isAdult,
        tags: [],
        attachments: attachments,
        parent: replyParentId || null,
      })

      setInternalText('')
      setAttachments([])

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onDoneAttachingUrls = (urls: string[]) => {
    setAttachments((currentAttachments) =>
      currentAttachments.concat(
        urls.map((url) => ({
          type: SocialAttachmentType.Image,
          url,
        }))
      )
    )
  }

  return (
    <div className={classes.root}>
      <formContext.Provider
        value={{
          createdSocialPost,
          internalText,
          setInternalText,
          isCreatingPost,
          isCreatePostSuccess,
          lastErrorCodeCreatingPost,
          attachments,
          setAttachments,
          isAdult,
          setIsAdult,
          onClickCreate,
          initialUsernameMapping,
          autoFocus,
        }}>
        <ImageUploader
          onDone={(urls) => onDoneAttachingUrls(urls)}
          bucketName={bucketNames.socialPostAttachments}
          resetOnDone
          clickToOpen={false}
          allowCropping={false}>
          {Form}
        </ImageUploader>
      </formContext.Provider>
    </div>
  )
}

export default CreateSocialPostForm
