import { useEffect, useState } from 'react'
import styled from '@emotion/styled'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'
import useDataStoreItem from '@/hooks/useDataStoreItem'

import {
  CollectionNames,
  AttachmentFields,
  AttachmentReason,
  AttachmentType,
  Attachment,
} from '@/modules/attachments'
import {
  ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon,
  Info as InfoIcon,
} from '@/icons'
import { bucketNames } from '@/file-uploading'
import { getIsUrlAYoutubeVideo } from '@/utils'

import TextInput from '../text-input'
// import Select, { MenuItem } from '../select'
import Button, { SaveButton } from '../button'
import CheckboxInput from '../checkbox-input'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import UrlInput from '../url-input'
import FormControls from '../form-controls'
import ImageUploader from '../image-uploader'
import AttachmentOutput from '../attachment'
import Heading from '../heading'
import MovableList from '../movable-list'
import NoResultsMessage from '../no-results-message'
import Tooltip from '../tooltip'
import { VRCArenaTheme } from '@/themes'
import useIsEditor from '@/hooks/useIsEditor'
import HintText from '../hint-text'

const Columns = styled.div`
  display: flex;
  align-items: center;
`
const Column = styled.div`
  padding: 0.25rem;
`
const Form = styled.div`
  display: flex;
  flex-direction: column;
`
const Item = styled.div`
  border-radius: ${({ theme }: { theme?: VRCArenaTheme }) =>
    theme!.shape.borderRadius}px;
  border-bottom: 0.25rem solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
`

const CreateAttachmentForm = ({
  onCreate,
  onMoveUp,
  onMoveDown,
  ...props
}: {
  url: string
  onCreate: (id: string) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
} & Omit<AttachmentFormProps, 'newFields'>) => {
  const [isSaving, isSuccess, lastErrorCode, create] = useDataStoreCreate<
    AttachmentFields,
    Attachment
  >(CollectionNames.Attachments)
  const [newFields, setNewFields] = useState<Partial<AttachmentFields>>({
    url: props.url,
    reason: props.reason,
    type: props.type,
    parenttable: props.parentTable,
    parentid: props.parentId,
    title: null,
    description: null,
    isadult: null,
  })

  const onClickCreate = async () => {
    const result = await create(newFields)
    if (!result) throw new Error('No result')
    onCreate(result.id)
  }

  return (
    <Item>
      <Columns>
        <Column style={{ width: '40%' }}>
          <AttachmentOutput
            attachment={{ url: props.url, type: props.type } as Attachment}
            width="100%"
          />
        </Column>
        <Column style={{ width: '55%' }}>
          <AttachmentForm
            newFields={newFields}
            onChange={(fields) => setNewFields(fields)}
            {...props}
          />
          {isSaving ? (
            <LoadingIndicator />
          ) : isSuccess ? (
            <SuccessMessage>Attachment created successfully</SuccessMessage>
          ) : lastErrorCode !== null ? (
            <ErrorMessage errorCode={lastErrorCode}>
              Failed to create attachment
            </ErrorMessage>
          ) : null}
          <FormControls>
            <SaveButton onClick={onClickCreate}>Create & Add</SaveButton>
          </FormControls>
        </Column>
        {onMoveUp && onMoveDown && (
          <Column style={{ width: '5%' }}>
            <div>
              <Button color="secondary" onClick={onMoveUp}>
                <ChevronUpIcon />
              </Button>
              <Button color="secondary" onClick={onMoveDown}>
                <ChevronDownIcon />
              </Button>
            </div>
          </Column>
        )}
      </Columns>
    </Item>
  )
}

const EditAttachmentForm = ({
  id,
  onMoveUp,
  onMoveDown,
  ...props
}: { id: string; onMoveUp: () => void; onMoveDown: () => void } & Omit<
  AttachmentFormProps,
  'newFields'
>) => {
  const [isLoading, lastErrorCodeLoading, attachment, hydrate] =
    useDataStoreItem<Attachment>(CollectionNames.Attachments, id)
  const [isSaving, isSuccess, lastErrorCode, save] = useDataStoreEdit<
    AttachmentFields,
    Attachment
  >(CollectionNames.Attachments, id)
  const [newFields, setNewFields] = useState<null | Partial<AttachmentFields>>(
    null
  )
  const isEditor = useIsEditor()

  useEffect(() => {
    if (!attachment) return
    setNewFields(attachment)
  }, [attachment ? attachment.id : null])

  const onClickSave = async () => {
    if (!newFields) throw new Error('Need fields')
    const result = await save(newFields)
    if (!result) throw new Error('No result')
  }

  return (
    <Item>
      <Columns>
        {attachment && (
          <Column style={{ width: '40%' }}>
            <AttachmentOutput
              width="100%"
              attachment={attachment}
              // for queue
              attachmentId={id}
              onRefresh={hydrate}
            />
          </Column>
        )}
        <Column style={{ width: '55%' }}>
          {isLoading ? (
            <LoadingIndicator message="Loading attachment..." />
          ) : lastErrorCodeLoading !== null ? (
            <ErrorMessage errorCode={lastErrorCodeLoading}>
              Failed to load attachment
            </ErrorMessage>
          ) : null}
          {newFields && (
            <AttachmentForm
              newFields={newFields}
              onChange={(fields) => setNewFields(fields)}
              {...props}
              isDisabled={!isEditor}
            />
          )}
          {isSaving ? (
            <LoadingIndicator />
          ) : isSuccess ? (
            <SuccessMessage>Attachment saved successfully</SuccessMessage>
          ) : lastErrorCode !== null ? (
            <ErrorMessage errorCode={lastErrorCode}>
              Failed to save attachment
            </ErrorMessage>
          ) : null}
          <FormControls>
            <div>
              <SaveButton
                color="secondary"
                onClick={onClickSave}
                isDisabled={!isEditor}>
                Save
              </SaveButton>
              {!isEditor && (
                <>
                  <br />
                  <HintText>*Only staff can edit attachment metadata</HintText>
                </>
              )}
            </div>
          </FormControls>
        </Column>
        <Column style={{ width: '5%' }}>
          <div>
            <Button color="secondary" onClick={onMoveUp}>
              <ChevronUpIcon />
            </Button>
            <Button color="secondary" onClick={onMoveDown}>
              <ChevronDownIcon />
            </Button>
          </div>
        </Column>
      </Columns>
    </Item>
  )
}

interface AttachmentFormProps {
  newFields: Partial<AttachmentFields>
  onChange?: (fields: Partial<AttachmentFields>) => void
  reason: AttachmentReason
  type?: AttachmentType
  parentTable: string
  parentId: string
  isDisabled?: boolean
}

const AttachmentForm = ({
  newFields,
  onChange,
  reason,
  type,
  parentTable,
  parentId,
  isDisabled,
}: AttachmentFormProps) => {
  const updateField = (fieldName: keyof AttachmentFields, newVal: any) => {
    if (!onChange) return
    onChange({
      ...(newFields || {}),
      [fieldName]: newVal,
    })
  }

  return (
    <Form>
      {/* <Select
        label="Reason"
        value={newFields.reason}
        onChange={(e) =>
          updateField('reason', e.target.value as AttachmentReason)
        }
        size="small">
        {Object.values(AttachmentReason).map((reason) => (
          <MenuItem key={reason} value={reason}>
            {reason}
          </MenuItem>
        ))}
      </Select>
      <Select
        label="Type"
        value={newFields.type}
        onChange={(e) => updateField('type', e.target.value as AttachmentType)}
        size="small">
        {Object.values(AttachmentType).map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select> */}
      <TextInput
        fullWidth
        label="Title (optional)"
        value={newFields.title || ''}
        onChange={(e) => updateField('title', e.target.value)}
        isDisabled={isDisabled}
      />
      <TextInput
        fullWidth
        label="Description (optional)"
        minRows={2}
        value={newFields.description || ''}
        onChange={(e) => updateField('description', e.target.value)}
        isDisabled={isDisabled}
      />
      <TextInput
        fullWidth
        label="License (optional)"
        value={newFields.license || ''}
        onChange={(e) => updateField('license', e.target.value)}
        isDisabled={isDisabled}
      />
      <CheckboxInput
        label={
          <>
            Do not specify adult or not (inherit from asset){' '}
            <Tooltip title="If the parent asset is adult, this attachment is adult too.">
              <InfoIcon />
            </Tooltip>
          </>
        }
        value={newFields.isadult === null}
        onChange={(newVal) =>
          updateField('isadult', newVal === true ? null : false)
        }
        isDisabled={isDisabled}
      />
      <CheckboxInput
        label="Is adult"
        value={newFields.isadult === true}
        onChange={(newVal) => updateField('isadult', newVal)}
        isDisabled={isDisabled || newFields.isadult === null}
      />
    </Form>
  )
}

function moveUp(ids: string[], id: string): string[] {
  const index = ids.indexOf(id)
  if (index <= 0) return ids // already first, or not found
  const newIds = [...ids]
  ;[newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]]
  return newIds
}

function moveDown(ids: string[], id: string): string[] {
  const index = ids.indexOf(id)
  if (index === -1 || index === ids.length - 1) return ids // not found, or already last
  const newIds = [...ids]
  ;[newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]]
  return newIds
}

const AttachmentsForm = ({
  reason,
  parentTable,
  parentId,
  ids,
  onChange,
}: {
  reason: AttachmentReason
  parentTable: string
  parentId: string
  ids?: string[]
  onChange: (ids: string[]) => void
}) => {
  const [isInImageMode, setIsImageMode] = useState(true)
  const [newUrls, setNewUrls] = useState<null | string[]>(null)
  const [urlTextVal, setUrlTextVal] = useState('')

  return (
    <>
      <Heading variant="h4">New Attachment</Heading>
      <FormControls>
        <Button
          checked={isInImageMode}
          onClick={() => setIsImageMode(true)}
          size="large"
          color="secondary"
          hollow={false}>
          Images
        </Button>{' '}
        <Button
          checked={!isInImageMode}
          onClick={() => setIsImageMode(false)}
          size="large"
          color="secondary"
          hollow={false}>
          YouTube Video
        </Button>
      </FormControls>
      {isInImageMode ? (
        <ImageUploader
          allowMultiple
          allowCropping={false}
          bucketName={bucketNames.attachments}
          onDone={(urls) =>
            setNewUrls((currentVal) => currentVal?.concat(urls) || urls)
          }
        />
      ) : (
        <UrlInput
          label="YouTube video URL"
          value={urlTextVal}
          onChange={(newVal) => setUrlTextVal(newVal)}
          button={
            <Button
              onClick={() =>
                setNewUrls(
                  (currentVal) =>
                    currentVal?.concat(urlTextVal.trim()) || [urlTextVal.trim()]
                )
              }
              isDisabled={!getIsUrlAYoutubeVideo(urlTextVal.trim())}>
              Add
            </Button>
          }
        />
      )}
      {newUrls?.length ? (
        <>
          <Heading variant="h4">Add Attachments</Heading>
          <MovableList>
            {newUrls.map((url) => (
              <div key={url}>
                <CreateAttachmentForm
                  url={url}
                  reason={reason}
                  type={
                    getIsUrlAYoutubeVideo(url)
                      ? AttachmentType.Url
                      : AttachmentType.Image
                  }
                  parentTable={parentTable}
                  parentId={parentId}
                  onCreate={(id) => {
                    onChange(ids?.concat(id) || [id])
                    setNewUrls(
                      (currentVal) => currentVal?.filter((v) => v !== url) || []
                    )
                  }}
                  onMoveUp={() => setNewUrls(moveUp(newUrls, url))}
                  onMoveDown={() => setNewUrls(moveDown(newUrls, url))}
                />
              </div>
            ))}
          </MovableList>
        </>
      ) : null}
      {ids && (
        <>
          <Heading variant="h4">Edit Attachments</Heading>
          {ids.length ? (
            <MovableList>
              {ids.map((id) => (
                <div key={id}>
                  <EditAttachmentForm
                    id={id}
                    reason={reason}
                    parentTable={parentTable}
                    parentId={parentId}
                    onMoveUp={() => onChange(moveUp(ids, id))}
                    onMoveDown={() => onChange(moveDown(ids, id))}
                  />
                </div>
              ))}
            </MovableList>
          ) : (
            <NoResultsMessage>No attachments</NoResultsMessage>
          )}
        </>
      )}
    </>
  )
}

export default AttachmentsForm
