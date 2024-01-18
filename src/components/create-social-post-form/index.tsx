import React, { createContext, useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import DeleteIcon from '@material-ui/icons/Delete'
import ImageIcon from '@material-ui/icons/Image'

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
      <Button
        onClick={onDelete}
        size="small"
        icon={<DeleteIcon />}
        iconOnly></Button>
    </div>
  )
}

const Form = ({ triggerOpen }: { triggerOpen: () => void }) => {
  const classes = useStyles()
  const {
    createdId,
    internalText,
    setInternalText,
    isAdult,
    setIsAdult,
    isCreatingPost,
    isErrorCreatingPost,
    isCreatePostSuccess,
    attachments,
    setAttachments,
    onClickCreate,
    initialUsernameMapping,
  } = useForm()
  const myUserId = useUserId()

  if (!myUserId) {
    return null
  }

  const isDoingSomething = isCreatingPost || isErrorCreatingPost

  const removeAttachment = (attachment: SocialAttachment) =>
    setAttachments(attachments.filter((item) => item.url !== attachment.url))

  return (
    <div className={classes.uploaderRoot}>
      {isCreatingPost ? (
        <LoadingIndicator message="Creating post..." />
      ) : isErrorCreatingPost ? (
        <ErrorMessage>Failed to create post</ErrorMessage>
      ) : isCreatePostSuccess ? (
        <SuccessMessage>
          Your post has been created :)
          <br />
          <br />
          <Button
            color="default"
            url={routes.socialWithPostVar.replace(
              ':postId',
              createdId || '<none>'
            )}>
            View On Social
          </Button>
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
            color="default"
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
  createdId: string | null
  internalText: string
  setInternalText: (
    userInputHtml: string | ((currentVal: string) => string)
  ) => void
  isCreatingPost: boolean
  isCreatePostSuccess: boolean
  isErrorCreatingPost: boolean
  attachments: SocialAttachment[]
  setAttachments: (newAttachments: SocialAttachment[]) => void
  isAdult: boolean
  setIsAdult: (newVal: boolean) => void
  onClickCreate: () => void
  initialUsernameMapping?: UsernameMapping
}

// @ts-ignore
const formContext = createContext<FormContext>()
const useForm = () => useContext(formContext)

const CreateSocialPostForm = ({
  initialText,
  replyParentId,
  onDone,
  initialUsernameMapping,
}: {
  initialText?: string
  replyParentId?: string
  onDone?: () => void
  initialUsernameMapping?: UsernameMapping
}) => {
  const [internalText, setInternalText] = useState(initialText || '')
  const [attachments, setAttachments] = useState<SocialAttachment[]>([])
  const [isAdult, setIsAdult] = useState(false)
  const [
    isCreatingPost,
    isCreatePostSuccess,
    isErrorCreatingPost,
    create,
    ,
    createdId,
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
          createdId,
          internalText,
          setInternalText,
          isCreatingPost,
          isCreatePostSuccess,
          isErrorCreatingPost,
          attachments,
          setAttachments,
          isAdult,
          setIsAdult,
          onClickCreate,
          initialUsernameMapping,
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
