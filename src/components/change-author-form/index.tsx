import React, { Fragment, useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'
import AddIcon from '@material-ui/icons/Add'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import TextInput from '../text-input'
import SearchForIdForm from '../search-for-id-form'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import AuthorResultsItem from '../author-results-item'
import Button from '../button'
import FormControls from '../form-controls'
import { Author, CollectionNames } from '../../modules/authors'
import InfoMessage from '../info-message'
import Paper from '../paper'
import Heading from '../heading'
import CheckboxInput from '../checkbox-input'
import ImageUploader from '../image-uploader'
import { AVATAR_HEIGHT, AVATAR_WIDTH } from '../../config'
import { bucketNames } from '../../file-uploading'

import authorEditableFields, {
  SectionNames,
} from '../../editable-fields/authors'
import { EditableField } from '../../editable-fields'
import { fieldTypes } from '../../generic-forms'
import {
  Claim,
  CollectionNames as ClaimCollectionNames,
} from '../../modules/claims'
import { Asset } from '../../modules/assets'
import FormFieldLabel from '../form-field-label'
import HintText from '../hint-text'
import ImageUploaderWithPreview from '../image-uploader-with-preview'

const fieldsBySectionName = authorEditableFields.reduce<{
  [sectionName: string]: EditableField<Author>[]
}>(
  (obj, editableField) => ({
    ...obj,
    [editableField.section!]:
      editableField.section! in obj
        ? obj[editableField.section!].concat([editableField])
        : [editableField],
  }),
  {}
)

const SearchResultRenderer = ({
  result,
  onClick,
}: {
  result: Author
  onClick: () => void
}) => {
  return (
    <AuthorResultsItem
      author={result}
      onClick={(e) => {
        onClick()
        e.preventDefault()
        return false
      }}
    />
  )
}

const FormField = ({
  editableField,
  value,
  onChange,
}: {
  editableField: EditableField<Author>
  value: any
  onChange: (newValue: any) => void
}) => (
  <>
    <br />
    <FormInput
      editableField={editableField}
      value={value}
      onChange={onChange}
    />
  </>
)

const FormInput = ({
  editableField,
  value,
  onChange,
}: {
  editableField: EditableField<Author>
  value: any
  onChange: (newValue: any) => void
}) => {
  switch (editableField.type) {
    case fieldTypes.text:
    case fieldTypes.textMarkdown:
      return (
        <>
          <TextInput
            label={editableField.label}
            onChange={(e) => onChange(e.target.value)}
            value={value}
            fullWidth
            rows={
              editableField.type === fieldTypes.textMarkdown ? 3 : undefined
            }
          />
          <HintText small>{editableField.hint}</HintText>
          <br />
        </>
      )
    case fieldTypes.imageUpload:
      return (
        <>
          <FormFieldLabel>{editableField.label}</FormFieldLabel>
          <br />
          <br />
          <ImageUploaderWithPreview
            value={value}
            onClear={() => onChange('')}
            onDone={(urls) => onChange(urls[0])}
            bucketName={bucketNames.authorAvatars}
            requiredWidth={AVATAR_WIDTH}
            requiredHeight={AVATAR_HEIGHT}
          />
          <HintText small>
            {editableField.hint} {editableField.imageUploadProperties?.width}x
            {editableField.imageUploadProperties?.height}
          </HintText>
          <br />
        </>
      )
    case fieldTypes.checkbox:
      return (
        <>
          <CheckboxInput
            label={editableField.label!}
            onChange={(newVal) => onChange(newVal)}
            value={value}
          />
          <HintText small>{editableField.hint}</HintText>
        </>
      )
    case fieldTypes.multichoice:
      const currentValue = value as string[]
      return (
        <>
          <FormFieldLabel>{editableField.label}</FormFieldLabel>
          <br />
          {editableField.options?.map((option) => (
            <CheckboxInput
              key={option.value}
              label={option.label}
              value={currentValue.includes(option.value!)}
              onChange={(newVal) =>
                onChange(
                  currentValue.includes(option.value!)
                    ? currentValue.filter((item) => item !== option.value!)
                    : currentValue.concat(option.value!)
                )
              }
            />
          ))}
          <br />
          <HintText small>{editableField.hint}</HintText>
          <br />
        </>
      )
    default:
      return (
        <>
          No renderer for {editableField.name} (type {editableField.type})
        </>
      )
  }
}

const CreateForm = ({
  onClick,
  actionCategory,
}: {
  onClick: (authorId: string, authorData: Author) => void
  actionCategory?: string
}) => {
  const [newFields, setNewFields] = useState<Partial<Author>>({
    name: '',
    description: '',
    websiteurl: '',
    email: '',
    twitterusername: '',
    gumroadusername: '',
    discordusername: '',
    discordserverinviteurl: '',
    patreonusername: '',
    categories: [],
    // ownedby: '',
    discordserverid: '',
    isopenforcommission: false,
    commissioninfo: '',
    showcommissionstatusforassets: false,
    avatarurl: '',
    bannerurl: '',
    boothusername: '',
    salereason: '',
    saledescription: '',
    saleexpiresat: undefined,
    promourl: '',
  })
  const [isSaving, isSuccess, lastErrorCode, create, clear] =
    useDatabaseSave<Author>(CollectionNames.Authors)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimingComments, setClaimingComments] = useState('')
  const [isSavingClaim, , lastClaimErrorCode, createClaim] =
    useDatabaseSave<Claim>(ClaimCollectionNames.Claims)

  const onCreate = async () => {
    try {
      if (actionCategory) {
        trackAction(actionCategory, 'Click create author button')
      }

      if (!newFields.name) {
        console.warn('Need an author name')
        return
      }

      const [createdDocument] = await create(newFields)

      if (createdDocument === null) {
        throw new Error('Newly created author is null')
      }

      if (isClaiming) {
        await createClaim({
          parenttable: CollectionNames.Authors,
          parent: createdDocument.id,
          comments: claimingComments.trim(),
        })
      }

      onClick(createdDocument.id, createdDocument)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const restart = () => {
    clear()
  }

  if (isSaving || isSavingClaim) {
    return (
      <LoadingIndicator
        message={isSaving ? 'Creating author...' : 'Adding claim...'}
      />
    )
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        Author created successfully
        {lastClaimErrorCode !== null ? (
          <>
            <br />
            <br />
            Failed to add claim. You should do this later by viewing the author.
          </>
        ) : null}
      </SuccessMessage>
    )
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage onRetry={restart}>
        Failed to create the author: error code {lastErrorCode}
      </ErrorMessage>
    )
  }

  const onChange = (fieldName: string, fieldValue: any) =>
    setNewFields((currentFields) => ({
      ...currentFields,
      [fieldName]: fieldValue,
    }))

  return (
    <Paper>
      <Heading variant="h3" noMargin>
        Create Author
      </Heading>
      {Object.entries(fieldsBySectionName).map(
        ([sectionName, editableFields]) => (
          <Fragment key={sectionName}>
            {editableFields
              .filter((editableField) => !editableField.name.includes('sale'))
              .map((editableField) => (
                <FormField
                  key={editableField.name}
                  editableField={editableField}
                  value={newFields[editableField.name]}
                  onChange={(newVal) => onChange(editableField.name, newVal)}
                />
              ))}
          </Fragment>
        )
      )}
      <Heading variant="h3">Claim</Heading>
      <CheckboxInput
        label="I claim to be this author"
        value={isClaiming}
        onChange={(e) => setIsClaiming((currentVal) => !currentVal)}
      />
      {isClaiming ? (
        <TextInput
          label="Supporting evidence of claim (optional)"
          value={claimingComments}
          onChange={(e) => setClaimingComments(e.target.value)}
          rows={3}
          fullWidth
        />
      ) : null}
      <FormControls>
        <Button onClick={() => onCreate()} icon={<SaveIcon />}>
          Create And Use
        </Button>
      </FormControls>
    </Paper>
  )
}

const ChangeAuthorForm = ({
  collectionName,
  id,
  overrideSave,
  onDone,
  actionCategory,
}: {
  collectionName: string
  id: string
  existingAuthorId?: string | null
  existingAuthorData?: Author | null
  overrideSave?: (newValue?: string | null) => void
  onDone?: () => void
  actionCategory?: string
}) => {
  const [isSaving, isSuccess, isErrored, save, clear] = useDatabaseSave<Asset>(
    collectionName,
    id ? id : null
  )
  const [isCreating, setIsCreating] = useState(false)

  const restart = () => {
    setIsCreating(false)
    clear()
  }

  const onSave = async (newAuthorId: string | null) => {
    try {
      if (overrideSave) {
        overrideSave(newAuthorId)

        if (onDone) {
          onDone()
        }
        return
      }

      if (actionCategory) {
        trackAction(actionCategory, 'Click save author button', {
          collectionName,
          id,
          authorId: newAuthorId,
        })
      }

      await save({
        author: newAuthorId || undefined,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const create = () => setIsCreating(true)

  if (isSaving) {
    return <LoadingIndicator message="Saving asset..." />
  }

  if (isSuccess) {
    return (
      <SuccessMessage onOkay={restart}>
        Resource has been updated with the new author
      </SuccessMessage>
    )
  }

  if (isErrored) {
    return (
      <ErrorMessage onOkay={restart}>Failed to save the resource</ErrorMessage>
    )
  }

  if (isCreating) {
    return <CreateForm onClick={onSave} actionCategory={actionCategory} />
  }

  return (
    <>
      <SearchForIdForm
        collectionName={CollectionNames.Authors}
        renderer={SearchResultRenderer}
        onClickWithIdAndDetails={onSave}
      />
      <InfoMessage>Can't find the author? Create it below</InfoMessage>
      <FormControls>
        <Button onClick={() => create()} icon={<AddIcon />}>
          Create Author
        </Button>
        {onDone ? (
          <Button onClick={() => onDone()} color="default">
            Cancel
          </Button>
        ) : null}
      </FormControls>
    </>
  )
}

export default ChangeAuthorForm
