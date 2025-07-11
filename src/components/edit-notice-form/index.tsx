import React, { useEffect, useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'
import { handleError } from '../../error-handling'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import { CollectionNames, Notice, NoticeFields } from '../../modules/notices'
import Button from '../button'
import CheckboxInput from '../checkbox-input'
import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import TextInput from '../text-input'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'

const EditNoticeForm = ({
  id = undefined,
  notice,
  onDone,
  onSave,
}: {
  id?: string
  notice?: Notice
  onSave: () => void
  onDone: () => void
}) => {
  const [fields, setFields] = useState<NoticeFields>({
    title: '',
    hideid: '',
    message: '',
    orderby: 0,
    isvisible: false,
  })
  const [isSaving, isSuccess, lastErrorCode, createOrEdit] = id
    ? useDataStoreEdit<Notice>(CollectionNames.Notices, id)
    : useDataStoreCreate<Notice>(CollectionNames.Notices)

  useEffect(() => {
    if (!id || !notice) {
      return
    }
    setFields({
      title: notice.title,
      hideid: notice.hideid,
      message: notice.message,
      orderby: notice.orderby,
      isvisible: notice.isvisible,
    })
  }, [id, JSON.stringify(notice)])

  const onClickEditOrCreate = async () => {
    try {
      if (!fields.title || !fields.message) {
        console.warn('Cannot do anything without title and message')
        return
      }

      await createOrEdit(fields)

      onSave()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isSaving) {
    return (
      <LoadingIndicator message={`${id ? 'Editing' : 'Creating'} notice...`} />
    )
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to {id ? 'edit' : 'create'} notice (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (isSuccess) {
    return (
      <SuccessMessage onOkay={onDone}>
        Notice {id ? 'edited' : 'created'}. You need to reload the page to see
        it
      </SuccessMessage>
    )
  }

  const setField = (fieldName: string, newVal: any) =>
    setFields((currentFields) => ({
      ...currentFields,
      [fieldName]: newVal,
    }))

  return (
    <>
      <TextInput
        value={fields.hideid}
        onChange={(e) => setField('hideid', e.target.value)}
        label="Hide ID"
        fullWidth
        helperText="Unique ID (all lowercase letters) used to know if notice hidden in browser"
      />
      <br />
      <TextInput
        value={fields.title}
        onChange={(e) => setField('title', e.target.value)}
        label="Title"
        fullWidth
        helperText="Shown at top"
      />
      <br />
      <TextInput
        value={fields.message}
        onChange={(e) => setField('message', e.target.value)}
        label="Message"
        fullWidth
        multiline
        minRows={3}
        helperText="Markdown supported"
      />
      <br />
      <CheckboxInput
        value={fields.isvisible}
        onChange={(newVal) => setField('isvisible', newVal)}
        label="Is visible"
      />
      <br />
      <TextInput
        value={fields.orderby}
        onChange={(e) => setField('orderby', parseInt(e.target.value))}
        label="Order"
        fullWidth
        helperText="The index to display to the user. 0 means first. 999 would be last."
      />
      <FormControls>
        <Button onClick={onClickEditOrCreate} icon={<SaveIcon />}>
          {id ? 'Save' : 'Create'}
        </Button>
      </FormControls>
    </>
  )
}

export default EditNoticeForm
