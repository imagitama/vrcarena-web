import React, { useCallback, useState } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Checkbox from '@material-ui/core/Checkbox'
import DeleteIcon from '@material-ui/icons/Delete'
import ClearIcon from '@material-ui/icons/Clear'

import Paper from '../../../../components/paper'
import TextInput from '../../../../components/text-input'
import { CommonFieldNames, CommonMetaFieldNames } from '../../../../data-store'
import useDataStore from '../../../../hooks/useDataStore'
import {
  CollectionNameComments,
  CollectionNameCommentsMeta,
  FullComment
} from '../../../../modules/comments'
import { client as supabase } from '../../../../supabase'
import LoadingIndicator from '../../../../components/loading-indicator'
import Markdown from '../../../../components/markdown'
import Button from '../../../../components/button'
import ErrorMessage from '../../../../components/error-message'
import NoResultsMessage from '../../../../components/no-results-message'
import FormattedDate from '../../../../components/formatted-date'
import UsernameLink from '../../../../components/username-link'
import Avatar, { sizes } from '../../../../components/avatar'
import EditorRecordManager from '../../../../components/editor-record-manager'
import useQueryParam from '../../../../hooks/useQueryParam'
import GenericOutputItem from '../../../../components/generic-output-item'
import Message from '../../../../components/message'
import { handleError } from '../../../../error-handling'
import { AccessStatuses } from '../../../../hooks/useDatabaseQuery'

const BulkControls = ({
  ids,
  cancel,
  onDone
}: {
  ids: string[]
  cancel: () => void
  onDone: () => void
}) => {
  const [wantsToDelete, setWantsToDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isError, setIsError] = useState(false)

  if (!ids.length) {
    return null
  }

  const performBulkDelete = async () => {
    try {
      setIsDeleting(true)
      setIsError(false)

      console.debug(`Deleting ${ids.length} comments...`)

      const { error } = await supabase
        .from(CollectionNameCommentsMeta)
        .update({
          [CommonMetaFieldNames.accessStatus]: AccessStatuses.Deleted
        })
        .in('id', ids)

      if (error) {
        throw new Error(
          `Failed to set access status to deleted: ${error.message}`
        )
      }

      onDone()
    } catch (err) {
      setIsDeleting(false)
      setIsError(true)
      console.error(err)
      handleError(err)
    }
  }

  if (isDeleting) {
    return <LoadingIndicator message="Bulk deleting..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to bulk delete</ErrorMessage>
  }

  if (wantsToDelete) {
    return (
      <Message noMargin>
        Are you sure you want to delete {ids.length} comments?
        <br />
        <br />
        <Button onClick={performBulkDelete} icon={<DeleteIcon />}>
          Yes I am sure
        </Button>{' '}
        <Button color="default" onClick={() => cancel()} icon={<ClearIcon />}>
          Cancel
        </Button>
      </Message>
    )
  }

  const bulkDelete = () => setWantsToDelete(true)

  return (
    <Message noMargin>
      <Button onClick={bulkDelete} icon={<DeleteIcon />}>
        Bulk Delete ({ids.length})
      </Button>
    </Message>
  )
}

const CommentsByUser = ({ userId }: { userId: string }) => {
  const getQuery = useCallback(
    () =>
      supabase
        .from('getfullcomments'.toLowerCase())
        .select('*', {
          count: 'estimated'
        })
        .eq(CommonFieldNames.createdBy, userId)
        .order(CommonFieldNames.createdAt, { ascending: false }),
    [userId]
  )
  const [
    isLoadingComments,
    isErrorLoadingComments,
    comments,
    ,
    hydrate
  ] = useDataStore<FullComment[]>(getQuery, 'user-comments')
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>([])

  if (isLoadingComments || !comments) {
    return <LoadingIndicator />
  }

  if (isErrorLoadingComments) {
    return <ErrorMessage>Failed to load comments</ErrorMessage>
  }

  if (!comments.length) {
    return <NoResultsMessage>The user has made no comments</NoResultsMessage>
  }

  const toggleIsSelected = (id: string) =>
    setSelectedCommentIds(currentVal =>
      currentVal.includes(id)
        ? currentVal.filter(itemId => itemId !== id)
        : currentVal.concat([id])
    )

  const clearSelectedCommentIds = () => setSelectedCommentIds([])

  const onBulkDelete = () => {
    hydrate()
    clearSelectedCommentIds()
  }

  const isSelectingAll = selectedCommentIds.length === comments.length

  const toggleSelectAll = () =>
    setSelectedCommentIds(
      isSelectingAll ? [] : comments.map(comment => comment.id)
    )

  return (
    <>
      <BulkControls
        ids={selectedCommentIds}
        cancel={clearSelectedCommentIds}
        onDone={onBulkDelete}
      />
      <Paper margin={selectedCommentIds.length > 0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Meta</TableCell>
              <TableCell />
              <TableCell>
                <Checkbox
                  checked={isSelectingAll}
                  onChange={() => toggleSelectAll()}
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments.map(comment => (
              <TableRow
                key={comment.id}
                selected={selectedCommentIds.includes(comment.id)}>
                <TableCell>
                  <Avatar url={comment.createdbyavatarurl} size={sizes.TINY} />
                  <UsernameLink
                    username={comment.createdbyusername}
                    id={comment.createdby}
                  />
                </TableCell>
                <TableCell>
                  <GenericOutputItem
                    type={comment.parenttable}
                    id={comment.parent}
                  />
                </TableCell>
                <TableCell>
                  <Markdown source={comment.comment} />
                </TableCell>
                <TableCell>
                  <FormattedDate date={comment.createdat} />
                </TableCell>
                <TableCell>
                  <EditorRecordManager
                    id={comment.id}
                    collectionName={CollectionNameComments}
                    metaCollectionName={CollectionNameCommentsMeta}
                    existingAccessStatus={comment.accessstatus}
                    existingEditorNotes={comment.editornotes}
                    // @ts-ignore
                    onDone={() => hydrate()}
                    showApprovalButtons={false}
                    showEditorNotes={false}
                    showBox={false}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={selectedCommentIds.includes(comment.id)}
                    onChange={() => toggleIsSelected(comment.id)}
                    color="default"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <BulkControls
        ids={selectedCommentIds}
        cancel={clearSelectedCommentIds}
        onDone={onBulkDelete}
      />
    </>
  )
}

export default () => {
  const userId = useQueryParam('userId') || ''
  const [textInput, setTextInput] = useState(userId)
  const [userIdToFilter, setUserIdToFilter] = useState(userId)

  const performFilter = () => setUserIdToFilter(textInput)

  return (
    <>
      <Paper>
        User ID:{' '}
        <TextInput
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          size="small"
        />{' '}
        <Button onClick={() => performFilter()}>Filter</Button>
      </Paper>
      <br />
      {userIdToFilter ? <CommentsByUser userId={userIdToFilter} /> : null}
    </>
  )
}
