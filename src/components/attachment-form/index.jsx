import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames } from '../../hooks/useDatabaseQuery'

import { handleError } from '../../error-handling'
import {
  AttachmentsFieldNames,
  attachmentSubTypes,
  attachmentTypes
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

const attachmentTypesMeta = {
  [attachmentTypes.image]: {
    name: 'Image'
  },
  [attachmentTypes.url]: {
    name: 'URL (eg. YouTube video, tweet)'
  }
}

const attachmentSubTypesMeta = {
  [attachmentSubTypes.screenshot]: {
    name: 'In-game photo or screenshot'
  },
  [attachmentSubTypes.meme]: {
    name: 'Meme'
  },
  [attachmentSubTypes.recording]: {
    name: 'In-game video or recording'
  },
  [attachmentSubTypes.news]: {
    name: 'News or new update'
  }
}

const useStyles = makeStyles({
  attachmentTypes: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  attachmentType: {
    padding: '1rem',
    margin: '0 0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  textInput: {
    width: '100%',
    margin: '0.5rem 0'
  },
  outputWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  typeData: {
    marginBottom: '2rem',
    fontSize: '150%',
    textShadow: '1px 1px 1px #000',
    textAlign: 'center'
  },
  attachmentImage: {
    width: '50%',
    margin: '2rem',
    border: '2px solid #FFF'
  }
})

function TypeSelector({ onSelectedTypeAndSubType }) {
  const classes = useStyles()
  const [selectedType, setSelectedType] = useState(null)
  const [selectedSubType, setSelectedSubType] = useState(null)

  if (!selectedType) {
    return (
      <div>
        <p>
          Select the kind of attachment you are adding:
          <div className={classes.attachmentTypes}>
            {Object.entries(attachmentTypesMeta).map(([typeName, { name }]) => (
              <div
                key={typeName}
                className={classes.attachmentType}
                onClick={() => setSelectedType(typeName)}>
                {name}
              </div>
            ))}
          </div>
        </p>
      </div>
    )
  }

  if (!selectedSubType) {
    return (
      <div>
        <p>
          Select the sub-type (optional):
          <div className={classes.attachmentTypes}>
            {Object.entries(attachmentSubTypesMeta).map(
              ([subTypeName, { name }]) => (
                <div
                  key={subTypeName}
                  className={classes.attachmentType}
                  onClick={() =>
                    onSelectedTypeAndSubType(selectedType, subTypeName)
                  }>
                  {name}
                </div>
              )
            )}
          </div>
        </p>
        <FormControls>
          <Button onClick={() => onSelectedTypeAndSubType(selectedType)}>
            Skip
          </Button>
        </FormControls>
      </div>
    )
  }

  return null
}

function AttachmentOutput({ type, url }) {
  const classes = useStyles()
  switch (type) {
    case attachmentTypes.image:
      return <img src={url} className={classes.attachmentImage} />
    case attachmentTypes.url:
      return <div>{url}</div>
    default:
      return <>Unknown type "{type}"</>
  }
}

export default ({
  attachmentId = null,
  parentTable,
  parentId,
  onDone = null,
  onCancel = null
}) => {
  const [fields, setFields] = useState({
    [AttachmentsFieldNames.type]: null,
    [AttachmentsFieldNames.subType]: null,
    [AttachmentsFieldNames.url]: '',
    [AttachmentsFieldNames.thumbnailUrl]: '',
    [AttachmentsFieldNames.title]: '',
    [AttachmentsFieldNames.description]: '',
    [AttachmentsFieldNames.isAdult]: false,
    [AttachmentsFieldNames.license]: null,
    [AttachmentsFieldNames.tags]: [],
    [AttachmentsFieldNames.parentTable]: parentTable,
    [AttachmentsFieldNames.parentId]: parentId
  })
  const [isSaving, isSaveSuccess, isSaveFailed, save] = useDatabaseSave(
    CollectionNames.Attachments,
    attachmentId || false //  false to not use shitty ID
  )
  const classes = useStyles()
  const [newUrl, setNewUrl] = useState('')

  const setField = (name, newVal) =>
    setFields(currentVal => ({
      ...currentVal,
      [name]: newVal
    }))

  const onFileUploadedWithUrl = async urls => {
    setField(AttachmentsFieldNames.url, urls[0])
  }

  const onSaveClick = async () => {
    try {
      await save(fields)

      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
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

  const onSelectedTypeAndSubType = (newType, newSubType = null) =>
    setFields(currentVal => ({
      ...currentVal,
      [AttachmentsFieldNames.type]: newType,
      [AttachmentsFieldNames.subType]: newSubType
    }))

  if (!fields[AttachmentsFieldNames.type]) {
    return <TypeSelector onSelectedTypeAndSubType={onSelectedTypeAndSubType} />
  }

  if (!fields[AttachmentsFieldNames.url]) {
    switch (fields[AttachmentsFieldNames.type]) {
      case attachmentTypes.image:
        return (
          <ImageUploader
            bucketName={bucketNames.attachments}
            directoryPath={''}
            onDone={onFileUploadedWithUrl}
          />
        )
      case attachmentTypes.url:
        return (
          <div>
            Enter the URL here:
            <TextInput
              onChange={e => setNewUrl(e.target.value)}
              className={classes.textInput}
            />
            Note that only YouTube videos and tweets will be embedded
            (everything else will show a button to vist the URL)
            <FormControls>
              <Button
                onClick={() => setField(AttachmentsFieldNames.url, newUrl)}>
                Done
              </Button>
            </FormControls>
          </div>
        )
      default:
        return <>Unknown type "{fields[AttachmentsFieldNames.type]}"</>
    }
  }

  return (
    <div>
      <div className={classes.output}>
        <div className={classes.outputWrapper}>
          <AttachmentOutput
            type={fields[AttachmentsFieldNames.type]}
            subType={fields[AttachmentsFieldNames.subType]}
            url={fields[AttachmentsFieldNames.url]}
          />
        </div>
        <div className={classes.typeData}>
          {attachmentTypesMeta[fields[AttachmentsFieldNames.type]].name}
          {fields[AttachmentsFieldNames.subType]
            ? ` - ${
                attachmentSubTypesMeta[fields[AttachmentsFieldNames.subType]]
                  .name
              }`
            : ''}
        </div>
      </div>
      Title (optional)
      <TextInput
        onChange={e => setField(AttachmentsFieldNames.title, e.target.value)}
        className={classes.textInput}
      />
      Description (optional)
      <TextInput
        onChange={e =>
          setField(AttachmentsFieldNames.description, e.target.value)
        }
        className={classes.textInput}
        multiline
        rows={5}
      />
      Tags (optional)
      <TagInput
        showInfo={false}
        onChange={newTags => setField(AttachmentsFieldNames.tags, newTags)}
      />
      <br />
      <CheckboxInput
        label="Is adult content"
        onChange={newBool => setField(AttachmentsFieldNames.isAdult, newBool)}
      />
      <FormControls>
        <Button onClick={() => onSaveClick()} icon={<SaveIcon />}>
          {attachmentId ? 'Save' : 'Create'}
        </Button>
        {onCancel && (
          <Button onClick={() => onCancel()} color="default">
            Cancel
          </Button>
        )}
      </FormControls>
    </div>
  )
}
