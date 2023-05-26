import React, { useEffect, useRef, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Markdown from '../markdown'
import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import SearchIcon from '@material-ui/icons/Search'

import Button from '../button'
import ErrorMessage from '../error-message'
import Paper from '../paper'
import LoadingIndicator from '../loading-indicator'
import TagInput from '../tag-input'
import TextInput from '../text-input'
import ImageUploader from '../firebase-image-uploader'
import FormControls from '../form-controls'
import AssetThumbnail from '../asset-thumbnail'

import { handleError } from '../../error-handling'
import {
  AssetFieldNames,
  AuthorFieldNames,
  CollectionNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { callFunction } from '../../firebase'
import { scrollToElement } from '../../utils'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, paths } from '../../config'
import {
  addQuotesToDescription,
  removeQuotesFromDescription
} from '../../utils/formatting'
// import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'
import { CommonFieldNames } from '../../data-store'
import categoryMeta from '../../category-meta'
import {
  getTagsFromDescription,
  getCategoryFromNameAndDescription,
  isValidPreviewImageUrl,
  defaultTags,
  getImageUrlAsFile
} from '../../utils/gumroad'
import { getAuthorFromAuthorName } from '../../utils/booth'
import { cleanupTags } from '../../utils/tags'

const useStyles = makeStyles({
  field: {
    width: '100%'
  },
  row: {
    marginBottom: '0.5rem'
  },
  btns: {
    textAlign: 'center',
    marginTop: '1rem'
  },
  thumbnailUploader: {
    width: '50%'
  }
})

const cleanupFields = fields => {
  const newFields = { ...fields }
  if (newFields[AssetFieldNames.tags]) {
    newFields[AssetFieldNames.tags] = cleanupTags(
      newFields[AssetFieldNames.tags]
    )
  }
  return newFields
}

const getFieldsToSave = (fields, whichFieldsAreEnabled) => {
  const fieldsToSave = {}

  for (const fieldName in fields) {
    if (whichFieldsAreEnabled[fieldName]) {
      fieldsToSave[fieldName] = fields[fieldName]
    }
  }

  return fieldsToSave
}

export default ({
  assetId,
  existingBoothUrl = '',
  onDone = null,
  onCancel = null,
  overrideSave = null,
  onFieldChanged = null,
  onFieldsChanged = null
}) => {
  const rootRef = useRef()
  const [urlValue, setUrlValue] = useState('')
  const [boothUrl, setBoothUrl] = useState(existingBoothUrl || '')
  const [isFetching, setIsFetching] = useState(true)
  const [isFetchError, setIsFetchError] = useState(false)
  const [newFields, setNewFields] = useState(null)
  const [whichFieldsAreEnabled, setWhichFieldsAreEnabled] = useState({
    [AssetFieldNames.title]: true,
    [AssetFieldNames.description]: true,
    [AssetFieldNames.tags]: true,
    [AssetFieldNames.thumbnailUrl]: true,
    [AssetFieldNames.fileUrls]: true,
    [AssetFieldNames.category]: true,
    [AssetFieldNames.author]: true
  })
  const [isSaving, , isErrored, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const [isUsingQuotes, setIsUsingQuotes] = useState(true)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [previewImageFile, setPreviewImageFile] = useState(null)
  const [authorName, setAuthorName] = useState(null)

  useEffect(() => {
    if (!newFields) {
      return
    }

    scrollToElement(rootRef.current)
  }, [newFields !== null])

  useEffect(() => {
    if (!existingBoothUrl) {
      return
    }
    setBoothUrl(existingBoothUrl)
  }, [existingBoothUrl])

  const populateFromBooth = async () => {
    try {
      setIsFetching(true)
      setIsFetchError(false)

      const {
        data: {
          title,
          descriptionMarkdown,
          ourPreviewUrl,
          ourPreviewUrlWebp,
          authorName
        }
      } = await callFunction(
        'getBoothProduct',
        {
          boothUrl
        }
        //         {
        //           data: {
        //             name: 'My in dev Gumroad asset',
        //             descriptionMarkdown: `# My asset

        // - Photoshop file included
        // - Dynamic Bones included
        // - shapekeys included`,
        //             ourPreviewUrl: defaultThumbnailUrl
        //           }
        //         }
      )

      const author = await getAuthorFromAuthorName(authorName)

      setIsFetching(false)
      setIsFetchError(false)
      updateFields({
        [AssetFieldNames.title]: title,
        [AssetFieldNames.description]: isUsingQuotes
          ? addQuotesToDescription(descriptionMarkdown)
          : descriptionMarkdown,
        [AssetFieldNames.tags]: getTagsFromDescription(
          descriptionMarkdown
        ).concat(defaultTags),
        [AssetFieldNames.category]: getCategoryFromNameAndDescription(
          title,
          descriptionMarkdown
        ),
        [AssetFieldNames.author]: author ? author.id : null,
        [AssetFieldNames.fileUrls]: ourPreviewUrlWebp ? [ourPreviewUrlWebp] : []
      })
      setAuthorName(author ? author[AuthorFieldNames.name] : null)

      if (!author || !author[AuthorFieldNames.name]) {
        toggleIsFieldEnabled(AssetFieldNames.author)
      }

      if (isValidPreviewImageUrl(ourPreviewUrl)) {
        const file = await getImageUrlAsFile(ourPreviewUrl)
        setPreviewImageFile(file)
        setPreviewImageUrl(ourPreviewUrl)
      }
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsFetching(false)
      setIsFetchError(true)
    }
  }

  useEffect(() => {
    populateFromBooth()
  }, [boothUrl])

  const onSaveBtnClick = async () => {
    try {
      const fieldsToSave = {
        ...getFieldsToSave(
          cleanupFields(newFields || {}),
          whichFieldsAreEnabled
        ),
        [AssetFieldNames.sourceUrl]: boothUrl // set this here so newly created assets have it
      }

      if (overrideSave) {
        overrideSave(fieldsToSave)

        if (onDone) {
          onDone()
        }
        return
      }

      await save({
        ...fieldsToSave
      })

      // note: on save this component is re-mounted so cannot rely on isSuccess
      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset', err)
      handleError(err)
    }
  }

  const updateField = (fieldName, newValue) => {
    setNewFields({
      ...(newFields ? newFields : {}),
      [fieldName]: newValue
    })

    if (onFieldChanged) {
      onFieldChanged(fieldName, newValue)
    }
  }

  const updateFields = fieldsToInsert => {
    setNewFields(currentFields => {
      const returnVal = {
        ...(currentFields ? currentFields : {}),
        ...fieldsToInsert
      }

      if (onFieldsChanged) {
        onFieldsChanged(returnVal)
      }

      return returnVal
    })
  }

  const toggleIsFieldEnabled = fieldName => {
    setWhichFieldsAreEnabled(currentEnabledFields => {
      const newVal = !currentEnabledFields[fieldName]

      const returnVal = {
        ...currentEnabledFields,
        [fieldName]: newVal
      }

      if (onFieldChanged) {
        onFieldChanged(fieldName, newVal ? newFields[fieldName] : undefined)
      }

      return returnVal
    })
  }

  if (isFetching) {
    return <LoadingIndicator message="Fetching from Booth..." />
  }

  if (isSaving) {
    return <LoadingIndicator>Saving...</LoadingIndicator>
  }

  if (isErrored) {
    return <ErrorMessage>Failed to save asset</ErrorMessage>
  }

  if (isFetchError) {
    return (
      <ErrorMessage>
        Failed to fetch from Booth
        <br />
        <br />
        <Button onClick={populateFromBooth}>Try Again</Button>
      </ErrorMessage>
    )
  }

  if (!newFields) {
    return (
      <>
        <p>Enter the Booth product page URL:</p>
        <TextInput
          value={urlValue}
          onChange={e => setUrlValue(e.target.value)}
        />
        <br />
        <FormControls>
          <Button icon={<SearchIcon />}>Load Product</Button>
        </FormControls>
      </>
    )
  }

  return (
    <div ref={rootRef}>
      <p>Select which fields you want to take from the Booth product page:</p>
      <Paper className={classes.row}>
        {isValidPreviewImageUrl(previewImageUrl) ? (
          <>
            Thumbnail
            <Checkbox
              checked={whichFieldsAreEnabled[AssetFieldNames.thumbnailUrl]}
              onClick={() => toggleIsFieldEnabled(AssetFieldNames.thumbnailUrl)}
            />
            {whichFieldsAreEnabled[AssetFieldNames.thumbnailUrl] &&
              (newFields[AssetFieldNames.thumbnailUrl] ? (
                <AssetThumbnail url={newFields[AssetFieldNames.thumbnailUrl]} />
              ) : (
                <div className={classes.thumbnailUploader}>
                  <ImageUploader
                    preloadImageUrl={previewImageUrl}
                    preloadFile={previewImageFile}
                    requiredWidth={THUMBNAIL_WIDTH}
                    requiredHeight={THUMBNAIL_HEIGHT}
                    onUploadedWithUrl={url =>
                      updateFields({
                        [AssetFieldNames.thumbnailUrl]: url
                      })
                    }
                    directoryPath={paths.assetThumbnailDir}
                    generateFilePrefix
                  />
                </div>
              ))}
          </>
        ) : (
          'Image cannot be used as a thumbnail (eg. it is .gif)'
        )}
      </Paper>
      <Paper className={classes.row}>
        Attach image (recommended)
        <Checkbox
          checked={whichFieldsAreEnabled[AssetFieldNames.fileUrls]}
          onClick={() => toggleIsFieldEnabled(AssetFieldNames.fileUrls)}
        />
        <br />
        <br />
        {newFields[AssetFieldNames.fileUrls] ? (
          <img src={newFields[AssetFieldNames.fileUrls][0]} height="400" />
        ) : (
          '(no image found - add it manually next tab)'
        )}
      </Paper>
      <Paper className={classes.row}>
        Title
        <Checkbox
          checked={whichFieldsAreEnabled[AssetFieldNames.title]}
          onClick={() => toggleIsFieldEnabled(AssetFieldNames.title)}
        />
        {whichFieldsAreEnabled[AssetFieldNames.title] && (
          <>
            <br />
            <TextField
              value={newFields[AssetFieldNames.title]}
              onChange={e => updateField(AssetFieldNames.title, e.target.value)}
              className={classes.field}
            />
          </>
        )}
      </Paper>
      <Paper className={classes.row}>
        Description
        <Checkbox
          checked={whichFieldsAreEnabled[AssetFieldNames.description]}
          onClick={() => toggleIsFieldEnabled(AssetFieldNames.description)}
        />
        {whichFieldsAreEnabled[AssetFieldNames.description] && (
          <>
            <br />
            <TextField
              value={newFields[AssetFieldNames.description]}
              onChange={e =>
                updateField(AssetFieldNames.description, e.target.value)
              }
              multiline
              rows={10}
              className={classes.field}
            />
            <Markdown source={newFields[AssetFieldNames.description]} />
          </>
        )}
      </Paper>
      {whichFieldsAreEnabled[AssetFieldNames.description] && (
        <Paper className={classes.row}>
          <Checkbox
            checked={isUsingQuotes}
            onClick={() => {
              updateField(
                AssetFieldNames.description,
                isUsingQuotes
                  ? removeQuotesFromDescription(
                      newFields[AssetFieldNames.description]
                    )
                  : addQuotesToDescription(
                      newFields[AssetFieldNames.description]
                    )
              )
              setIsUsingQuotes(!isUsingQuotes)
            }}
          />{' '}
          Add quote symbols to description (recommended)
        </Paper>
      )}
      <Paper className={classes.row}>
        Author
        <Checkbox
          checked={whichFieldsAreEnabled[AssetFieldNames.author]}
          onClick={() => toggleIsFieldEnabled(AssetFieldNames.author)}
        />
        {whichFieldsAreEnabled[AssetFieldNames.author] && (
          <>
            {newFields[AssetFieldNames.author] && authorName
              ? authorName
              : '(no existing author detected - add it manually next tab)'}
          </>
        )}
      </Paper>
      <Paper className={classes.row}>
        Category
        <Checkbox
          checked={whichFieldsAreEnabled[AssetFieldNames.category]}
          onClick={() => toggleIsFieldEnabled(AssetFieldNames.category)}
        />
        {whichFieldsAreEnabled[AssetFieldNames.category] && (
          <>
            {newFields[AssetFieldNames.category]
              ? categoryMeta[newFields[AssetFieldNames.category]].name
              : '(no category detected - add it manually next tab)'}
          </>
        )}
      </Paper>
      <Paper className={classes.row}>
        Tags
        <Checkbox
          checked={whichFieldsAreEnabled[AssetFieldNames.tags]}
          onClick={() => toggleIsFieldEnabled(AssetFieldNames.tags)}
        />
        {whichFieldsAreEnabled[AssetFieldNames.tags] && (
          <>
            <br />
            Tags have been populated using the description from Gumroad:
            <br />
            <TagInput
              currentTags={newFields[AssetFieldNames.tags]}
              onChange={newTags => updateField(AssetFieldNames.tags, newTags)}
              categoryName={newFields[AssetFieldNames.category]}
            />
          </>
        )}
      </Paper>
      <div className={classes.btns}>
        <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
          Save
        </Button>{' '}
        <Button onClick={() => onCancel()} color="default">
          Cancel
        </Button>
      </div>
    </div>
  )
}
