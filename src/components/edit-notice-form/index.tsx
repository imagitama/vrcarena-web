import React, { useEffect, useState } from 'react'
import { handleError } from '../../error-handling'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import {
  collectionName as collectionNameNotices,
  Notice,
  NoticeFields,
  NoticesFieldNames,
} from '../../modules/notices'
import Button from '../button'
import CheckboxInput from '../checkbox-input'
import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import Heading from '../heading'
import LoadingIndicator from '../loading-indicator'
import Paper from '../paper'
import SuccessMessage from '../success-message'
import TextInput from '../text-input'

export default ({
  id = undefined,
  notice,
}: {
  id?: string
  notice?: Notice
}) => {
  const [fields, setFields] = useState<NoticeFields>({
    title: '',
    hideid: '',
    message: '',
    orderby: 0,
    isvisible: false,
  })
  const [isSaving, isSuccess, isError, createOrEdit] = useDatabaseSave(
    collectionNameNotices,
    id
  )

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
  }, [id, notice !== undefined])

  const onClickEditOrCreate = async () => {
    try {
      if (!fields.title || !fields.message) {
        console.warn('Cannot do anything without title and message')
        return
      }

      await createOrEdit(fields)
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

  if (isError) {
    return (
      <ErrorMessage>Failed to {id ? 'edit' : 'create'} notice</ErrorMessage>
    )
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
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
    <Paper>
      <Heading variant="h3" noTopMargin>
        {id ? 'Edit Notice' : 'Create Notice'}
      </Heading>
      <TextInput
        value={fields.hideid}
        onChange={(e) => setField(NoticesFieldNames.hideid, e.target.value)}
        label="Hide ID"
        fullWidth
        helperText="Unique ID (all lowercase letters) used to know if notice hidden in browser"
      />
      <br />
      <TextInput
        value={fields.title}
        onChange={(e) => setField(NoticesFieldNames.title, e.target.value)}
        label="Title"
        fullWidth
        helperText="Shown at top"
      />
      <br />
      <TextInput
        value={fields.message}
        onChange={(e) => setField(NoticesFieldNames.message, e.target.value)}
        label="Message"
        fullWidth
        multiline
        rows={3}
        helperText="Markdown supported"
      />
      <br />
      <CheckboxInput
        value={fields.isvisible}
        // @ts-ignore
        onChange={(newVal) => setField(NoticesFieldNames.isVisible, newVal)}
        label="Is visible"
      />
      <br />
      <TextInput
        value={fields.orderby}
        onChange={(e) =>
          setField(NoticesFieldNames.orderby, parseInt(e.target.value))
        }
        label="Order"
        fullWidth
        helperText="The index to display to the user. 0 means first. 999 would be last."
      />
      <FormControls>
        <Button onClick={onClickEditOrCreate} size="small">
          {id ? 'Edit' : 'Create'}
        </Button>
      </FormControls>
    </Paper>
  )
}
