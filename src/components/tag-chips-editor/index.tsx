import { Suspense, useState } from 'react'
import styled from '@emotion/styled'

import useDataStoreCreate from '@/hooks/useDataStoreCreate'
import useIsEditor from '@/hooks/useIsEditor'
import useTimer from '@/hooks/useTimer'
import useDataStoreEdit from '@/hooks/useDataStoreEdit'

import {
  Amendment,
  AmendmentFields,
  CollectionNames as AmendmentsCollectionNames,
} from '@/modules/amendments'
import {
  AssetFields,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'

import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import TagChips, { StyledTagChips } from '../tag-chips'
import TagChip from '../tag-chip'
import TagInput from '../tag-input'
import Button from '../button'
import {
  Submit as SubmitIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@/icons'
import TextInput from '../text-input'
import { routes } from '@/routes'
import DialogButton from '../dialog-button'
import Heading from '../heading'
import FormControls from '../form-controls'

enum Operation {
  Add,
  Remove,
  Unchanged,
}

interface TagChange {
  tag: string
  operation: Operation
}

const getTagsDiff = (currentTags: string[], newTags: string[]): TagChange[] => {
  const currentSet = new Set(currentTags)
  const newSet = new Set(newTags)

  const removed: TagChange[] = currentTags
    .filter((tag) => !newSet.has(tag))
    .map((tag) => ({ tag, operation: Operation.Remove }))

  const added: TagChange[] = newTags
    .filter((tag) => !currentSet.has(tag))
    .map((tag) => ({ tag, operation: Operation.Add }))

  const unchanged: TagChange[] = currentTags
    .filter((tag) => newSet.has(tag))
    .map((tag) => ({ tag, operation: Operation.Unchanged }))

  return [...removed, ...added, ...unchanged]
}

const Form = styled.div`
  margin: 0.25rem 0;
`

const TagChipsEditor = ({
  currentTags,
  assetId,
  onDone,
}: {
  currentTags: string[]
  assetId: string
  onDone: () => void
}) => {
  const [newTags, setNewTags] = useState<string[]>(currentTags)
  const [commentsVal, setCommentsVal] = useState('')
  const isEditor = useIsEditor()
  const isAmending = !isEditor
  const [
    isCreating,
    isCreateSuccess,
    lastCreateErrorCode,
    create,
    ,
    createdAmendment,
  ] = useDataStoreCreate<AmendmentFields, Amendment>(
    AmendmentsCollectionNames.Amendments
  )
  const [isEditing, isEditSuccess, lastEditErrorCode, edit] =
    useDataStoreEdit<AssetFields>(AssetsCollectionNames.Assets, assetId)
  //   const onDoneAfterDelay = useTimer(onDone)

  const onClickSubmit = async () => {
    if (isAmending) {
      const result = await create({
        parenttable: AssetsCollectionNames.Assets,
        parent: assetId,
        fields: {
          tags: newTags,
        },
        comments: commentsVal || null,
      })

      if (!result) throw new Error('No result')
    } else {
      await edit({
        tags: newTags,
      })
    }

    // onDoneAfterDelay()
  }

  if (isCreating) return <LoadingIndicator message="Creating amendment..." />
  if (isEditing) return <LoadingIndicator message="Editing asset..." />

  if (isCreateSuccess)
    return (
      <SuccessMessage
        onOkay={onDone}
        controls={[
          <Button
            url={routes.viewAmendmentWithVar.replace(
              ':amendmentId',
              createdAmendment ? createdAmendment.id : ''
            )}
            color="secondary"
            hollow
            size="small">
            View Amendment
          </Button>,
        ]}>
        Amendment created successfully. Our staff will review it with 48 hours.
        <br />
        <br />
        If it has been longer than that, please open a support ticket or message
        in our Discord server.
      </SuccessMessage>
    )
  if (isEditSuccess)
    return (
      <SuccessMessage onOkay={onDone}>Asset edited successfully</SuccessMessage>
    )

  if (lastCreateErrorCode !== null)
    return (
      <ErrorMessage errorCode={lastCreateErrorCode}>
        Failed to create amendment
      </ErrorMessage>
    )
  if (lastEditErrorCode !== null)
    return (
      <ErrorMessage errorCode={lastEditErrorCode}>
        Failed to edit asset
      </ErrorMessage>
    )

  const onDelete = (tagToDelete: string) =>
    setNewTags((tags) =>
      tags.includes(tagToDelete)
        ? tags.filter((tag) => tag !== tagToDelete)
        : tags.concat(tagToDelete)
    )
  const addTag = (tagToAdd: string) =>
    setNewTags((tags) =>
      tags.includes(tagToAdd) ? tags : tags.concat(tagToAdd)
    )

  const tagsDiff = getTagsDiff(currentTags, newTags)

  return (
    <>
      <StyledTagChips>
        {tagsDiff
          .sort((a, b) => a.tag.localeCompare(b.tag))
          .map(({ tag, operation }) => {
            return (
              <Suspense key={tag}>
                <TagChip
                  tagName={tag}
                  onDelete={() => onDelete(tag)}
                  noLink
                  icon={
                    operation === Operation.Add ? (
                      <AddIcon />
                    ) : operation === Operation.Remove ? (
                      <RemoveIcon />
                    ) : undefined
                  }
                  positivity={
                    operation === Operation.Add
                      ? 1
                      : operation === Operation.Remove
                      ? -1
                      : 0
                  }
                />
              </Suspense>
            )
          })}
      </StyledTagChips>
      <Form>
        <TagInput onNewTag={addTag} />
      </Form>
      <DialogButton
        dialog={
          <>
            <Heading variant="h1" noTopMargin>
              {isAmending ? 'Create Amendment' : 'Edit Asset'}
            </Heading>
            <p>
              Are you sure you want to{' '}
              {isAmending ? 'create this amendment' : 'edit this asset'}?
            </p>
            <Heading variant="h2">Added Tags</Heading>
            <TagChips
              tags={tagsDiff
                .filter((tagDiff) => tagDiff.operation === Operation.Add)
                .map((tagDiff) => tagDiff.tag)}
            />
            <Heading variant="h2">Removed Tags</Heading>
            <TagChips
              tags={tagsDiff
                .filter((tagDiff) => tagDiff.operation === Operation.Remove)
                .map((tagDiff) => tagDiff.tag)}
            />
            {isAmending && (
              <>
                <Heading variant="h2">Comments</Heading>
                <TextInput
                  fullWidth
                  value={commentsVal}
                  onChange={(e) => setCommentsVal(e.target.value)}
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Explain why you are changing the tags"
                />
              </>
            )}
            <FormControls>
              <Button icon={<SubmitIcon />} onClick={onClickSubmit}>
                {isAmending ? 'Create Amendment' : 'Edit Asset'}
              </Button>
            </FormControls>
          </>
        }
        icon={<SubmitIcon />}
        size="small">
        Proceed
      </DialogButton>
    </>
  )
}

export default TagChipsEditor
