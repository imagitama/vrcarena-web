import React, { Fragment, useState } from 'react'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import { Notice, collectionName } from '../../modules/notices'
import Button from '../button'
import EditNoticeForm from '../edit-notice-form'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import NoticeRenderer from '../notice'

export default () => {
  const [isLoading, isError, notices] = useDataStoreItems<Notice>(
    collectionName,
    undefined
  )
  const [editId, setEditId] = useState<string | undefined>(undefined)

  if (isLoading || !notices) {
    return <LoadingIndicator message="Loading notices..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load notices</ErrorMessage>
  }

  return (
    <>
      <EditNoticeForm
        id={editId}
        notice={notices.find((notice) => notice.id === editId)}
      />
      <br />
      {notices.map((notice) => (
        <Fragment key={notice.id}>
          {/* @ts-ignore */}
          <NoticeRenderer {...notice} />
          <Button onClick={() => setEditId(notice.id)}>
            Edit "{notice.hideid}"
          </Button>
        </Fragment>
      ))}
    </>
  )
}
