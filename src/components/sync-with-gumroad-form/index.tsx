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
import ImageUploader from '../image-uploader'
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
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, paths } from '../../config'
import {
  addQuotesToDescription,
  removeQuotesFromDescription
} from '../../utils/formatting'
import categoryMeta from '../../category-meta'
import {
  getAuthorFromGumroadSubdomain,
  getTagsFromDescription,
  getCategoryFromNameAndDescription,
  getImageUrlAsFile,
  isValidPreviewImageUrl,
  getCodeFromGumroadUrl,
  getAuthorSubdomainFromGumroadUrl,
  defaultTags
} from '../../utils/gumroad'
import { cleanupTags } from '../../utils/tags'
import { inDevelopment } from '../../environment'
import devContent from './dev.json'
import { scrollToElement } from '../../utils'
import { bucketNames } from '../../file-uploading'
import WarningMessage from '../warning-message'

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

type AssetFields = { [fieldName: string]: any }

const cleanupFields = (fields: AssetFields): AssetFields => {
  const newFields = { ...fields }
  if (newFields[AssetFieldNames.tags]) {
    newFields[AssetFieldNames.tags] = cleanupTags(
      newFields[AssetFieldNames.tags]
    )
  }
  return newFields
}

const getFieldsToSave = (
  fields: AssetFields,
  whichFieldsAreEnabled: { [fieldName: string]: boolean }
): AssetFields => {
  const fieldsToSave: AssetFields = {}

  for (const fieldName in fields) {
    if (whichFieldsAreEnabled[fieldName]) {
      fieldsToSave[fieldName] = fields[fieldName]
    }
  }

  return fieldsToSave
}

export default ({
  assetId,
  existingGumroadUrl = '',
  onDone = undefined,
  onCancel = undefined,
  onFieldChanged = undefined,
  onFieldsChanged = undefined,
  overrideSaveWithNewFields = undefined
}: {
  assetId: string
  existingGumroadUrl?: string
  onDone?: () => void
  onCancel?: () => void
  onFieldChanged?: (fieldName: string, value: any) => void
  onFieldsChanged?: (fields: AssetFields) => void
  overrideSaveWithNewFields?: (fields: AssetFields) => void
}) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const [urlValue, setUrlValue] = useState('')
  const [gumroadUrl, setGumroadUrl] = useState(existingGumroadUrl || '')
  const [isFetching, setIsFetching] = useState(true)
  const [isFetchError, setIsFetchError] = useState(false)
  const [newFields, setNewFields] = useState<AssetFields | null>(null)
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
  const [previewImageFile, setPreviewImageFile] = useState<File | undefined>()
  const [authorName, setAuthorName] = useState<string | null>(null)

  useEffect(() => {
    if (!newFields) {
      return
    }

    if (rootRef.current) {
      scrollToElement(rootRef.current)
    }
  }, [newFields !== null])

  useEffect(() => {
    if (!existingGumroadUrl) {
      return
    }
    setGumroadUrl(existingGumroadUrl)
  }, [existingGumroadUrl])

  const populateFromGumroad = async () => {
    try {
      setIsFetching(true)
      setIsFetchError(false)

      const code = getCodeFromGumroadUrl(gumroadUrl)

      if (!code) {
        throw new Error(`Failed to get code from gumroad URL: ${gumroadUrl}`)
      }

      const authorSubdomain = getAuthorSubdomainFromGumroadUrl(gumroadUrl)

      if (!authorSubdomain) {
        throw new Error(
          `Failed to get author subdomain from gumroad URL: ${gumroadUrl}`
        )
      }

      const {
        data: { name, descriptionMarkdown, ourPreviewUrl, ourPreviewUrlWebp }
      } = inDevelopment()
        ? devContent
        : await callFunction('fetchGumroadInfo', {
            code,
            authorSubdomain
          })

      const author = await getAuthorFromGumroadSubdomain(authorSubdomain)

      setIsFetching(false)
      setIsFetchError(false)
      updateFields({
        [AssetFieldNames.title]: name,
        [AssetFieldNames.description]: isUsingQuotes
          ? addQuotesToDescription(descriptionMarkdown)
          : descriptionMarkdown,
        [AssetFieldNames.tags]: getTagsFromDescription(
          descriptionMarkdown
        ).concat(defaultTags),
        [AssetFieldNames.category]: getCategoryFromNameAndDescription(
          name,
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
      } else {
        console.warn(`"${ourPreviewUrl}" is not a valid preview URL`)
      }
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsFetching(false)
      setIsFetchError(true)
    }
  }

  useEffect(() => {
    populateFromGumroad()
  }, [gumroadUrl])

  const onSaveBtnClick = async () => {
    try {
      const fieldsToSave: AssetFields = {
        ...getFieldsToSave(
          cleanupFields(newFields || {}),
          whichFieldsAreEnabled
        ),
        [AssetFieldNames.sourceUrl]: gumroadUrl // set this here so newly created assets have it
      }

      if (overrideSaveWithNewFields) {
        overrideSaveWithNewFields(fieldsToSave)

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

  const updateField = (fieldName: string, newValue: any) => {
    setNewFields({
      ...(newFields ? newFields : {}),
      [fieldName]: newValue
    })

    if (onFieldChanged) {
      onFieldChanged(fieldName, newValue)
    }
  }

  const updateFields = (fieldsToInsert: AssetFields) => {
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

  const toggleIsFieldEnabled = (fieldName: string) => {
    setWhichFieldsAreEnabled(currentEnabledFields => {
      const newVal = !currentEnabledFields[fieldName]

      const returnVal = {
        ...currentEnabledFields,
        [fieldName]: newVal
      }

      if (onFieldChanged && newFields) {
        onFieldChanged(fieldName, newVal ? newFields[fieldName] : undefined)
      }

      return returnVal
    })
  }

  if (isFetching) {
    return (
      <LoadingIndicator message="Fetching from Gumroad (takes up to a minute)..." />
    )
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to save asset</ErrorMessage>
  }

  if (isFetchError) {
    return (
      <ErrorMessage>
        Failed to fetch from Gumroad
        <br />
        <br />
        <Button onClick={populateFromGumroad}>Try Again</Button>
      </ErrorMessage>
    )
  }

  if (!newFields) {
    return (
      <>
        <p>Enter the Gumroad product page URL:</p>
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
      <p>Select which fields you want to take from the Gumroad product page:</p>
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
                  <WarningMessage>
                    As of April 2023 we are migrating to a new way of uploading
                    images. Please contact me (Peanut#1756) if you experience
                    any issues with this
                  </WarningMessage>
                  <ImageUploader
                    bucketName={bucketNames.assetThumbnails}
                    directoryPath={assetId}
                    preloadImageUrl={previewImageUrl}
                    preloadFile={previewImageFile}
                    requiredWidth={THUMBNAIL_WIDTH}
                    requiredHeight={THUMBNAIL_HEIGHT}
                    onDone={url =>
                      updateFields({
                        [AssetFieldNames.thumbnailUrl]: url
                      })
                    }
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
        {onCancel ? (
          <Button onClick={() => onCancel()} color="default">
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  )
}
