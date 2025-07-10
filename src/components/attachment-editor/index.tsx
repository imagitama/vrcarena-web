import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import { handleError } from '../../error-handling'
import {
  Attachment,
  AttachmentFields,
  AttachmentReason,
  AttachmentType,
  CollectionNames,
} from '../../modules/attachments'

import ImageUploader from '../image-uploader'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import TextInput from '../text-input'
import CheckboxInput from '../checkbox-input'
import TagInput from '../tag-input'
import Button from '../button'
import FormControls from '../form-controls'
import { bucketNames } from '../../file-uploading'
import AttachmentOutput from '../attachment'
import InfoMessage from '../info-message'
import { getYouTubeVideoIdFromUrl, getIsUrlAYoutubeVideo } from '../../utils'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '../../config'
import { VRCArenaTheme } from '../../themes'
import useIsBanned from '../../hooks/useIsBanned'
import NoPermissionMessage from '../no-permission-message'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'

const attachmentTypesMeta: { [key: string]: { name: string } } = {
  [AttachmentType.Image]: {
    name: 'Image',
  },
  [AttachmentType.Url]: {
    name: 'URL (YouTube video, social media post, etc)',
  },
}

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  content: {
    margin: '2rem 0',
  },
  attachmentTypes: {
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentType: {
    padding: '1rem',
    margin: '0 0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    '&:hover': {
      cursor: 'pointer',
      background: theme.palette.action.hover,
    },
  },
  textInput: {
    width: '100%',
    margin: '0.5rem 0',
  },
  outputWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtn: {
    margin: '0.5rem 0',
    textAlign: 'center',
  },
  typeData: {
    margin: '1rem 0 0.5rem',
    fontSize: '150%',
    textShadow: '1px 1px 1px #000',
    textAlign: 'center',
  },
  attachmentImage: {
    width: '50%',
    margin: '2rem',
    border: '2px solid #FFF',
  },
  title: {
    fontSize: '150%',
    textAlign: 'center',
  },
  expandBtnWrapper: {
    textAlign: 'center',
  },
}))

function TypeSelector({
  onSelectedType,
}: {
  onSelectedType: (type: AttachmentType) => void
}) {
  const classes = useStyles()

  return (
    <div>
      <div className={classes.title}>Select a type:</div>
      <div className={classes.attachmentTypes}>
        {Object.entries(attachmentTypesMeta).map(([typeName, { name }]) => (
          <div
            key={typeName}
            className={classes.attachmentType}
            onClick={() => onSelectedType(typeName as AttachmentType)}>
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}

const getPreloadImageUrl = (url: string): string | undefined => {
  if (getIsUrlAYoutubeVideo(url)) {
    return `https://i.ytimg.com/vi/${getYouTubeVideoIdFromUrl(
      url
    )}/hqdefault.jpg`
  }
}

const AttachmentEditor = ({
  attachmentId,
  reason,
  parentTable,
  parentId,
  attachment,
  onDone = undefined,
  onCancel = undefined,
  isPreExpanded = false,
  allowEmptyIsAdult = true,
}: {
  reason: AttachmentReason
  attachmentId?: string
  parentTable?: string
  parentId?: string
  attachment?: Attachment
  onDone?: (fields: AttachmentFields, newId?: string) => void
  onCancel?: () => void
  isPreExpanded?: boolean
  allowEmptyIsAdult?: boolean
}) => {
  const emptyRecord = {
    reason,
    type: null,
    url: '',
    thumbnailurl: '',
    title: '',
    description: '',
    isadult: allowEmptyIsAdult ? null : false, // null to inherit
    license: null,
    tags: [],
    parenttable: parentTable,
    parentid: parentId,
  }

  const [fields, setFields] = useState<AttachmentFields>(
    attachment
      ? {
          reason: attachment.reason,
          type: attachment.type,
          url: attachment.url,
          thumbnailurl: attachment.thumbnailurl,
          title: attachment.title,
          description: attachment.description,
          isadult: attachment.isadult,
          license: attachment.license,
          tags: attachment.tags,
          parenttable: attachment.parenttable,
          parentid: attachment.parentid,
        }
      : emptyRecord
  )
  const [isSaving, isSaveSuccess, isSaveFailed, saveOrCreate] = attachmentId
    ? useDataStoreEdit<Attachment>(CollectionNames.Attachments, attachmentId)
    : useDataStoreCreate<Attachment>(CollectionNames.Attachments)
  const classes = useStyles()
  const [newUrl, setNewUrl] = useState('')
  const [isExpanded, setIsExpanded] = useState(isPreExpanded)

  if (useIsBanned()) {
    return <NoPermissionMessage />
  }

  const setField = (name: keyof AttachmentFields, newVal: any) =>
    setFields((currentVal) => ({
      ...currentVal,
      [name]: newVal,
    }))

  const onFileUploadedWithUrl = async (urls: string[]) => {
    setField('url', urls[0])
  }

  const reset = () =>
    setFields({
      ...emptyRecord,
    })

  const onSaveClick = async () => {
    try {
      console.debug(`AttachmentEditor.onSaveClick`, { fields })

      const newAttachment = await saveOrCreate(fields)

      if (onDone) {
        onDone(newAttachment)
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isSaving) {
    return (
      <LoadingIndicator
        message={`${attachmentId ? 'Saving' : 'Creating'} attachment...`}
      />
    )
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Attachment has been {attachmentId ? 'edited' : 'created'} successfully
      </SuccessMessage>
    )
  }

  if (isSaveFailed) {
    return (
      <ErrorMessage>Failed to save attachment - internal error</ErrorMessage>
    )
  }

  const onSelectedType = (newType: AttachmentType) =>
    setFields((currentVal) => ({
      ...currentVal,
      type: newType,
    }))

  if (!fields.type) {
    return <TypeSelector onSelectedType={onSelectedType} />
  }

  const clearType = () =>
    setFields((currentFields) => ({ ...currentFields, type: null }))

  if (!fields.url) {
    switch (fields.type) {
      case AttachmentType.Image:
        return (
          <ImageUploader
            bucketName={bucketNames.attachments}
            directoryPath={''}
            onDone={onFileUploadedWithUrl}
            onCancel={clearType}
          />
        )
      case AttachmentType.Url:
        return (
          <>
            <TextInput
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className={classes.textInput}
              placeholder="eg. https://www.youtube.com/abcdef"
              label="Enter the URL"
            />
            <InfoMessage>
              Only YouTube videos will be embedded (everything else will show a
              button to visit the URL)
            </InfoMessage>
            <FormControls>
              <Button onClick={() => setField('url', newUrl)}>Done</Button>
              <Button onClick={clearType} color="secondary">
                Cancel
              </Button>
            </FormControls>
          </>
        )
      default:
        return <>Unknown type "{fields.type}"</>
    }
  }

  const SaveButton = () => (
    <FormControls>
      <Button onClick={() => onSaveClick()} icon={<SaveIcon />}>
        {attachmentId ? 'Save' : 'Create'} Attachment
      </Button>
      <Button onClick={reset} color="secondary">
        Start Again
      </Button>
      {onCancel && (
        <Button onClick={() => onCancel()} color="secondary">
          Cancel
        </Button>
      )}
    </FormControls>
  )

  return (
    <div>
      <div>
        <div className={classes.content}>
          <div>
            <div className={classes.outputWrapper}>
              <AttachmentOutput attachment={fields} showFileUrls />
            </div>
            <div className={classes.typeData}>
              {/* @ts-ignore */}
              {attachmentTypesMeta[fields.type].name}{' '}
            </div>
          </div>
          {isExpanded ? (
            <>
              Thumbnail
              {fields.thumbnailurl ? (
                <div>
                  <img src={fields.thumbnailurl} alt="Thumbnail" />
                  <br />
                  <Button
                    color="secondary"
                    onClick={() => setField('thumbnailurl', null)}>
                    Clear
                  </Button>
                </div>
              ) : (
                <ImageUploader
                  onDone={(urls) => setField('thumbnailurl', urls[0])}
                  bucketName={bucketNames.attachmentThumbnails}
                  preloadImageUrl={getPreloadImageUrl(fields.url)}
                  requiredWidth={THUMBNAIL_WIDTH}
                  requiredHeight={THUMBNAIL_HEIGHT}
                />
              )}
              <TextInput
                label="Title"
                value={fields.title}
                onChange={(e) => setField('title', e.target.value)}
                className={classes.textInput}
              />
              <TextInput
                label="Description"
                value={fields.description}
                onChange={(e) => setField('description', e.target.value)}
                className={classes.textInput}
                multiline
                minRows={5}
              />
              Tags (optional)
              <TagInput
                currentTags={fields.tags}
                onChange={(newTags) => setField('tags', newTags)}
                showRecommendedTags={false}
              />
              <CheckboxInput
                label="Is adult content"
                value={fields.isadult === true}
                onChange={(newBool) => setField('isadult', newBool)}
              />
              {parentTable ? (
                <>
                  <br />
                  <em>
                    Note: If the parent is also flagged as adult it may override
                    this setting
                  </em>
                </>
              ) : null}
            </>
          ) : (
            <div className={classes.expandBtnWrapper}>
              <Button onClick={() => setIsExpanded(true)}>
                Add Extra Metadata...
              </Button>
            </div>
          )}
        </div>
      </div>
      <SaveButton />
    </div>
  )
}

export default AttachmentEditor
