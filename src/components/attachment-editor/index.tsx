import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import { handleError } from '../../error-handling'
import {
  Attachment,
  AttachmentFields,
  AttachmentReason,
  AttachmentType,
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

const attachmentTypesMeta: { [key: string]: { name: string } } = {
  [AttachmentType.Image]: {
    name: 'Image',
  },
  [AttachmentType.File]: {
    name: 'File (link to a ZIP, RAR, etc)',
  },
  [AttachmentType.Url]: {
    name: 'Other URL (YouTube video, social media post, etc)',
  },
}

const useStyles = makeStyles((theme) => ({
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
      <div className={classes.title}>
        What kind of attachment are you adding?
      </div>
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

const AttachmentEditor = ({
  attachmentId,
  reason,
  parentTable,
  parentId,
  attachment,
  // overrideSave = undefined,
  onDone = undefined,
  onCancel = undefined,
}: {
  reason: AttachmentReason
  attachmentId?: string
  parentTable: string
  parentId: string
  attachment?: Attachment
  onDone?: (fields: AttachmentFields, newId?: string) => void
  onCancel?: () => void
}) => {
  if (!attachment && (!reason || !parentTable || !parentId)) {
    throw new Error('Need to provide either attachment or a reason/parent')
  }

  const emptyRecord = {
    reason,
    type: null,
    url: '',
    thumbnailurl: '',
    title: '',
    description: '',
    isadult: false,
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
  const [isSaving, isSaveSuccess, isSaveFailed, save] = useDatabaseSave<
    AttachmentFields,
    Attachment
  >(CollectionNames.Attachments, attachmentId || null)
  const classes = useStyles()
  const [newUrl, setNewUrl] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

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

      const [newRecord] = await save(fields)
      const returnVal = newRecord !== null ? newRecord.id : undefined

      console.debug(`AttachmentEditor.onSaveClick.done`, {
        newRecord,
        returnVal,
      })

      if (onDone) {
        onDone(newRecord ? newRecord : fields, returnVal)
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

  if (!fields.url) {
    switch (fields.type) {
      case AttachmentType.Image:
        return (
          <ImageUploader
            bucketName={bucketNames.attachments}
            directoryPath={''}
            onDone={onFileUploadedWithUrl}
          />
        )
      case AttachmentType.Url:
        return (
          <div>
            Enter the URL here:
            <TextInput
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className={classes.textInput}
            />
            Note that only YouTube videos will be embedded (everything else will
            show a button to visit the URL)
            <FormControls>
              <Button onClick={() => setField('url', newUrl)}>Done</Button>
            </FormControls>
          </div>
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
      {onCancel && (
        <Button onClick={() => onCancel()} color="default">
          Cancel
        </Button>
      )}
    </FormControls>
  )

  return (
    <div>
      <div>
        <SaveButton />
        <div className={classes.content}>
          <div>
            <div className={classes.outputWrapper}>
              <AttachmentOutput attachment={fields} showFileUrls />
            </div>
            <div className={classes.typeData}>
              {/* @ts-ignore */}
              {attachmentTypesMeta[fields.type].name}{' '}
            </div>
            <div className={classes.resetBtn}>
              <Button
                onClick={() => {
                  reset()
                }}
                color="default">
                Start Again
              </Button>
            </div>
          </div>
          {isExpanded ? (
            <>
              Title (optional)
              <TextInput
                value={fields.title}
                onChange={(e) => setField('title', e.target.value)}
                className={classes.textInput}
              />
              Description (optional)
              <TextInput
                value={fields.description}
                onChange={(e) => setField('description', e.target.value)}
                className={classes.textInput}
                multiline
                rows={5}
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
              <br />
              <em>
                Note: If the parent is also flagged as adult it may override
                this setting
              </em>
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
