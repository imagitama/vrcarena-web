import React, { useEffect, useRef, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import SearchIcon from '@material-ui/icons/Search'

import Button from '../button'
import ErrorMessage from '../error-message'
import Paper from '../paper'
import LoadingIndicator from '../loading-indicator'
import TextInput from '../text-input'
import ImageUploader from '../image-uploader'
import FormControls from '../form-controls'
import AssetThumbnail from '../asset-thumbnail'

import { handleError } from '../../error-handling'
import {
  AssetFieldNames,
  AuthorFieldNames,
  CollectionNames,
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from '../../config'
import {
  addQuotesToDescription,
  removeQuotesFromDescription,
} from '../../utils/formatting'
import categoryMeta from '../../category-meta'
import {
  getCategoryFromNameAndDescription,
  defaultTags,
  getAuthorByNameOrUrl,
} from '../../utils/gumroad'
import { isUrlAYoutubeVideo, scrollToElement } from '../../utils'
import { bucketNames } from '../../file-uploading'
import useFirebaseFunction from '../../hooks/useFirebaseFunction'
import { callFunction } from '../../firebase'
import YoutubePlayer from '../youtube-player'
import { getImageUrlAsFile } from '../../utils/files'

const useStyles = makeStyles({
  field: {
    width: '100%',
  },
  row: {
    marginBottom: '0.5rem',
  },
  btns: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  thumbnailUploader: {
    width: '50%',
  },
  attachments: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    '& > div': {
      margin: '0 0.5rem 0.5rem 0',
    },
  },
  thumbnailAttachmentSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    '& > div': {
      margin: '0 0.5rem 0.5rem 0',
      cursor: 'pointer',
    },
  },
})

type AssetFields = { [fieldName: string]: any }

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

const attachmentItemTypes = {
  IMAGE: 'IMAGE',
  HOSTED_VIDEO: 'HOSTED_VIDEO',
  EMBED: 'EMBED',
}

interface GetGumroadProductAttachment {
  type: string
  url: string
  mimeType?: string
}

interface GetGumroadProductResult {
  title: string
  descriptionMarkdown: string
  price: string // $40+
  authorName: string
  authorUrl: string
  attachments: GetGumroadProductAttachment[]
  features: string[]
}

const ThumbnailAttachmentSelector = ({
  attachments,
  onSelect,
}: {
  attachments: GetGumroadProductAttachment[]
  onSelect: (selectedAttachment: GetGumroadProductAttachment) => void
}) => {
  const classes = useStyles()
  return (
    <div className={classes.thumbnailAttachmentSelector}>
      {attachments.map((attachment) => (
        <img
          src={attachment.url}
          width={200}
          onClick={() => onSelect(attachment)}
        />
      ))}
    </div>
  )
}

const getDoesAttachmentNeedOptimizing = (
  attachment: GetGumroadProductAttachment
): boolean =>
  attachment && attachment.mimeType
    ? attachment.mimeType === 'image/png' ||
      attachment.mimeType === 'image/jpg' ||
      attachment.mimeType === 'image/jpeg'
    : false

const AttachmentsOptimizer = ({
  attachmentsToOptimize,
  onDone,
}: {
  attachmentsToOptimize: GetGumroadProductAttachment[]
  onDone: (newFileUrls: string[]) => void
}) => {
  const [loadingStates, setLoadingStates] = useState<boolean[]>(
    attachmentsToOptimize.map(() => false)
  )
  const [errorStates, setErrorStates] = useState<boolean[]>(
    attachmentsToOptimize.map(() => false)
  )
  const [optimizedImageUrls, setOptimizedImageUrls] = useState<
    (null | string)[]
  >(attachmentsToOptimize.map(() => null))
  const classes = useStyles()

  const setIsLoading = (index: number, newValue: boolean) =>
    setLoadingStates((currentStates) => {
      const newStates = [...currentStates]
      newStates[index] = newValue
      return newStates
    })
  const setIsError = (index: number, newValue: boolean) =>
    setErrorStates((currentStates) => {
      const newStates = [...currentStates]
      newStates[index] = newValue
      return newStates
    })
  const setOptimizedImageUrl = (index: number, newValue: string) =>
    setOptimizedImageUrls((currentStates) => {
      const newStates = [...currentStates]
      newStates[index] = newValue
      return newStates
    })

  const downloadAndOptimizeImage = async (
    index: number,
    imageUrl: string
  ): Promise<string> => {
    try {
      setIsLoading(index, true)
      setIsError(index, false)

      const {
        data: { optimizedUrl },
      } = await callFunction('downloadAndOptimizeImage', {
        imageUrl,
        bucketName: bucketNames.attachments,
        bucketPath: '',
      })

      setIsLoading(index, false)
      setIsError(index, false)
      setOptimizedImageUrl(index, optimizedUrl)

      return optimizedUrl
    } catch (err) {
      console.error(err)
      handleError(err)

      setIsLoading(index, false)
      setIsError(index, true)

      throw err
    }
  }

  useEffect(() => {
    ;(async () => {
      console.debug(`optimizing ${attachmentsToOptimize.length} attachments...`)

      let optimizedUrlsToReturn: string[] = []

      await Promise.all(
        attachmentsToOptimize.map(async (attachment, index) => {
          if (getDoesAttachmentNeedOptimizing(attachment)) {
            const optimizedUrl = await downloadAndOptimizeImage(
              index,
              attachment.url
            )
            optimizedUrlsToReturn.push(optimizedUrl)
          } else {
            optimizedUrlsToReturn.push(attachment.url)
          }
        })
      )

      console.debug(
        `optimization complete, returning ${optimizedUrlsToReturn.length} urls...`
      )

      onDone(optimizedUrlsToReturn)
    })()
  }, [])

  return (
    <div className={classes.attachments}>
      {attachmentsToOptimize.map((attachment, index) => (
        <div key={index}>
          {getDoesAttachmentNeedOptimizing(attachment) ? (
            loadingStates[index] ? (
              <LoadingIndicator message={`Optimizing #${index + 1}...`} />
            ) : errorStates[index] ? (
              <ErrorMessage>Failed to optimize image #{index + 1}</ErrorMessage>
            ) : (
              <img src={optimizedImageUrls[index] || ''} width={300} />
            )
          ) : (
            <YoutubePlayer url={attachment.url} />
          )}
        </div>
      ))}
    </div>
  )
}

const useGumroadProduct = () =>
  useFirebaseFunction<{ gumroadProductUrl: string }, GetGumroadProductResult>(
    'getGumroadProduct'
  )

const AttachmentsOutput = ({ urls }: { urls: string[] }) => {
  const classes = useStyles()
  return (
    <div className={classes.attachments}>
      {urls.map((url) => (
        <div key={url}>
          {isUrlAYoutubeVideo(url) ? (
            <YoutubePlayer url={url} />
          ) : (
            <img src={url} width={300} />
          )}
        </div>
      ))}
    </div>
  )
}

export default ({
  assetId,
  existingGumroadUrl = '',
  onDone = undefined,
  onCancel = undefined,
  onFieldChanged = undefined,
  onFieldsChanged = undefined,
  overrideSaveWithNewFields = undefined,
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
  const [newFields, setNewFields] = useState<AssetFields | null>(null)
  const [whichFieldsAreEnabled, setWhichFieldsAreEnabled] = useState({
    [AssetFieldNames.title]: true,
    [AssetFieldNames.description]: true,
    [AssetFieldNames.thumbnailUrl]: true,
    [AssetFieldNames.fileUrls]: true,
    [AssetFieldNames.category]: true,
    [AssetFieldNames.author]: true,
  })
  const [isSaving, , isErrored, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const [isUsingQuotes, setIsUsingQuotes] = useState(true)
  const [authorName, setAuthorName] = useState<string | null>(null)

  const [selectedThumbnailAttachment, setSelectedThumbnailAttachment] =
    useState<null | GetGumroadProductAttachment>(null)
  const [selectedThumbnailAttachmentFile, setSelectedThumbnailAttachmentFile] =
    useState<null | File>(null)
  const [attachmentsToOptimize, setAttachmentsToOptimize] = useState<
    null | GetGumroadProductAttachment[]
  >(null)

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

  const [
    isGettingProduct,
    isFailedGettingProduct,
    gumroadProduct,
    callGetGumroadProductFunction,
  ] = useGumroadProduct()

  const populateFromGumroad = async () => {
    const result = await callGetGumroadProductFunction({
      gumroadProductUrl: gumroadUrl,
    })

    setAttachmentsToOptimize(
      result.attachments.filter(
        (attachment) =>
          attachment &&
          (getDoesAttachmentNeedOptimizing(attachment) ||
            (attachment && attachment.type === attachmentItemTypes.EMBED))
      )
    )

    updateFields({
      [AssetFieldNames.title]: result.title,
      [AssetFieldNames.description]: isUsingQuotes
        ? addQuotesToDescription(result.descriptionMarkdown)
        : result.descriptionMarkdown,
      [AssetFieldNames.tags]: defaultTags,
      [AssetFieldNames.category]: getCategoryFromNameAndDescription(
        result.title,
        result.descriptionMarkdown
      ),
    })

    const author = await getAuthorByNameOrUrl(
      result.authorName,
      result.authorUrl
    )
    setAuthorName(author ? author[AuthorFieldNames.name] : null)

    if (!author || !author[AuthorFieldNames.name]) {
      toggleIsFieldEnabled(AssetFieldNames.author)
    }
  }

  useEffect(() => {
    populateFromGumroad()
  }, [gumroadUrl])

  const onSaveBtnClick = async () => {
    try {
      if (!newFields) {
        console.warn('Trying to save without any new fields')
        return
      }

      const fieldsToSave: AssetFields = {
        ...getFieldsToSave(newFields, whichFieldsAreEnabled),
        [AssetFieldNames.sourceUrl]: gumroadUrl, // set this here so newly created assets have it
      }

      if (overrideSaveWithNewFields) {
        overrideSaveWithNewFields(fieldsToSave)

        if (onDone) {
          onDone()
        }
        return
      }

      await save({
        ...fieldsToSave,
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
      [fieldName]: newValue,
    })

    if (onFieldChanged) {
      onFieldChanged(fieldName, newValue)
    }
  }

  const updateFields = (fieldsToInsert: AssetFields) => {
    setNewFields((currentFields) => {
      const returnVal = {
        ...(currentFields ? currentFields : {}),
        ...fieldsToInsert,
      }

      if (onFieldsChanged) {
        onFieldsChanged(returnVal)
      }

      return returnVal
    })
  }

  const toggleIsFieldEnabled = (fieldName: string) => {
    setWhichFieldsAreEnabled((currentEnabledFields) => {
      const newVal = !currentEnabledFields[fieldName]

      const returnVal = {
        ...currentEnabledFields,
        [fieldName]: newVal,
      }

      if (onFieldChanged && newFields) {
        onFieldChanged(fieldName, newVal ? newFields[fieldName] : undefined)
      }

      return returnVal
    })
  }

  if (isGettingProduct) {
    return <LoadingIndicator message="Getting product from Gumroad..." />
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to save asset</ErrorMessage>
  }

  if (isFailedGettingProduct) {
    return (
      <ErrorMessage>
        Failed to get from Gumroad
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
          onChange={(e) => setUrlValue(e.target.value)}
        />
        <br />
        <FormControls>
          <Button icon={<SearchIcon />}>Load Product</Button>
        </FormControls>
      </>
    )
  }

  const validThumbnailAttachments =
    gumroadProduct &&
    gumroadProduct &&
    gumroadProduct.attachments &&
    gumroadProduct.attachments.filter(
      (attachment) =>
        attachment && attachment.type === attachmentItemTypes.IMAGE
    )

  return (
    <div ref={rootRef}>
      <p>Select which fields you want to take from the Gumroad product page:</p>
      <Paper className={classes.row}>
        <>
          Thumbnail
          <Checkbox
            checked={whichFieldsAreEnabled[AssetFieldNames.thumbnailUrl]}
            onClick={() => toggleIsFieldEnabled(AssetFieldNames.thumbnailUrl)}
          />
          {whichFieldsAreEnabled[AssetFieldNames.thumbnailUrl] &&
            (newFields[AssetFieldNames.thumbnailUrl] ? (
              <AssetThumbnail url={newFields[AssetFieldNames.thumbnailUrl]} />
            ) : !selectedThumbnailAttachment ? (
              <div className={classes.thumbnailUploader}>
                Select an image to use for the thumbnail (you will be able to
                crop it):
                <br />
                {validThumbnailAttachments ? (
                  <ThumbnailAttachmentSelector
                    attachments={validThumbnailAttachments}
                    onSelect={async (selectedAttachment) => {
                      try {
                        setSelectedThumbnailAttachment(selectedAttachment)
                        setSelectedThumbnailAttachmentFile(
                          await getImageUrlAsFile(
                            selectedAttachment.url,
                            'thumbnail',
                            'png'
                          )
                        )
                      } catch (err) {
                        console.error(err)
                        handleError(err)
                      }
                    }}
                  />
                ) : (
                  '(waiting for attachments)'
                )}
              </div>
            ) : selectedThumbnailAttachmentFile ? (
              <ImageUploader
                bucketName={bucketNames.assetThumbnails}
                directoryPath={assetId}
                preloadFile={selectedThumbnailAttachmentFile}
                preloadImageUrl={selectedThumbnailAttachment.url}
                requiredWidth={THUMBNAIL_WIDTH}
                requiredHeight={THUMBNAIL_HEIGHT}
                onDone={(urls) =>
                  updateFields({
                    [AssetFieldNames.thumbnailUrl]: urls[0],
                  })
                }
                onCancel={() => setSelectedThumbnailAttachment(null)}
              />
            ) : (
              <>Waiting for File</>
            ))}
        </>
      </Paper>
      <Paper className={classes.row}>
        Attachments
        <Checkbox
          checked={whichFieldsAreEnabled[AssetFieldNames.fileUrls]}
          onClick={() => toggleIsFieldEnabled(AssetFieldNames.fileUrls)}
        />
        {attachmentsToOptimize && attachmentsToOptimize.length ? (
          <>
            These images are being optimized (this takes up to a minute):
            <AttachmentsOptimizer
              attachmentsToOptimize={attachmentsToOptimize}
              onDone={(newFileUrls) => {
                setAttachmentsToOptimize(null)
                updateField(AssetFieldNames.fileUrls, newFileUrls)
              }}
            />
          </>
        ) : (
          <AttachmentsOutput urls={newFields[AssetFieldNames.fileUrls] || []} />
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
              onChange={(e) =>
                updateField(AssetFieldNames.title, e.target.value)
              }
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
              onChange={(e) =>
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
            {newFields[AssetFieldNames.author] &&
            gumroadProduct &&
            gumroadProduct.authorName
              ? gumroadProduct.authorName
              : '(no existing author detected - add it manually)'}
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
